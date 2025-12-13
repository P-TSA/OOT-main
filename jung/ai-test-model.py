# =========================
# 0) CUDA .so 경로 자동 보정 (torch import 전에)
# =========================
import os, sys, glob, site

def _collect_nvidia_lib_dirs():
    lib_dirs = set()
    sp_list = []
    try:
        sp_list.extend(site.getsitepackages())
    except Exception:
        pass
    try:
        usp = site.getusersitepackages()
        if usp:
            sp_list.append(usp)
    except Exception:
        pass

    sp_list.extend([
        "/usr/local/lib/python3.9/site-packages",
        "/usr/local/lib64/python3.9/site-packages",
        "/usr/lib/python3.9/site-packages",
        "/usr/lib64/python3.9/site-packages",
    ])

    for sp in sp_list:
        if not sp or not os.path.isdir(sp):
            continue
        for p in glob.glob(os.path.join(sp, "nvidia", "*", "lib")):
            if os.path.isdir(p):
                lib_dirs.add(p)
        for p in glob.glob(os.path.join(sp, "nvidia", "*", "lib64")):
            if os.path.isdir(p):
                lib_dirs.add(p)

    hard = "/usr/local/lib/python3.9/site-packages/nvidia/cusparselt/lib"
    if os.path.isdir(hard):
        lib_dirs.add(hard)

    return sorted(lib_dirs)

def _patch_ld_library_path_and_reexec():
    if os.environ.get("_LD_LIBRARY_PATH_PATCHED") == "1":
        return
    lib_dirs = _collect_nvidia_lib_dirs()
    if not lib_dirs:
        return
    old = os.environ.get("LD_LIBRARY_PATH", "")
    old_list = [p for p in old.split(":") if p]
    new_list = [d for d in lib_dirs if d not in old_list]
    new_list.extend(old_list)
    new = ":".join(new_list)
    if new != old:
        os.environ["LD_LIBRARY_PATH"] = new
        os.environ["_LD_LIBRARY_PATH_PATCHED"] = "1"
        os.execv(sys.executable, [sys.executable] + sys.argv)

_patch_ld_library_path_and_reexec()

# =========================
# 1) imports
# =========================
import numpy as np
import joblib
import torch
import torch.nn as nn

# =========================
# 2) 모델 정의 (학습 코드와 동일해야 함)
# =========================
class MultiHeadClothesNet(nn.Module):
    def __init__(self, num_weather_codes, num_top_classes, num_bottom_classes):
        super().__init__()
        emb_dim = min(16, max(4, (num_weather_codes + 1) // 2))
        self.weather_emb = nn.Embedding(num_weather_codes, emb_dim)

        self.trunk = nn.Sequential(
            nn.Linear(emb_dim + 2, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
        )

        self.head_top = nn.Linear(64, num_top_classes)
        self.head_bottom = nn.Linear(64, num_bottom_classes)

    def forward(self, w_idx, x_num):
        w = self.weather_emb(w_idx)
        h = torch.cat([w, x_num], dim=1)
        z = self.trunk(h)
        return self.head_top(z), self.head_bottom(z)

# =========================
# 3) 로드
# =========================
le_top = joblib.load("top_label_encoder.pkl")
le_bottom = joblib.load("bottom_label_encoder.pkl")
code_to_idx = joblib.load("weather_code_to_idx.pkl")
scaler = joblib.load("num_scaler.pkl")
num_mean = scaler["num_mean"]
num_std = scaler["num_std"]

num_weather_codes = len(code_to_idx)
num_top_classes = len(le_top.classes_)
num_bottom_classes = len(le_bottom.classes_)

if not torch.cuda.is_available():
    raise RuntimeError("CUDA 사용 불가 (CPU 사용 금지 조건)")

device = torch.device("cuda")
model = MultiHeadClothesNet(num_weather_codes, num_top_classes, num_bottom_classes).to(device)
model.load_state_dict(torch.load("clothes_multitask_gpu.pt", map_location=device))
model.eval()

# =========================
# 4) TOP-k 방식 추천 (상의×하의 조합 TOP-k)
#    - 상의/하의를 따로 TOP-k 뽑는 대신,
#      조합 점수 = P(top) * P(bottom) 로 계산해서
#      "상의-하의 조합"을 TOP-k로 반환
# =========================
@torch.no_grad()
def recommend_combo(weather_code: int, temperature: float, wind_speed: float,
                    top_k_each: int = 5, combo_topk: int = 10):
    # 4-1) weather_code -> idx (학습에 없던 코드면 0번으로 fallback)
    if weather_code in code_to_idx:
        w = code_to_idx[weather_code]
    else:
        w = 0

    # 4-2) 수치 스케일링 (학습과 동일)
    x = np.array([temperature, wind_speed], dtype=np.float32)
    x = (x - num_mean) / (num_std + 1e-8)

    w_t = torch.tensor([w], dtype=torch.long, device=device)
    x_t = torch.tensor([x], dtype=torch.float32, device=device)

    out_top, out_bottom = model(w_t, x_t)

    # 확률
    p_top = torch.softmax(out_top, dim=1).squeeze(0)       # (Ct,)
    p_bottom = torch.softmax(out_bottom, dim=1).squeeze(0) # (Cb,)

    # 상의/하의 각각에서 후보를 줄여서(속도) 조합 계산
    k_top = min(top_k_each, p_top.numel())
    k_bot = min(top_k_each, p_bottom.numel())

    top_vals, top_idx = torch.topk(p_top, k=k_top)
    bot_vals, bot_idx = torch.topk(p_bottom, k=k_bot)

    # 조합 점수 행렬: (k_top, k_bot)
    # 점수 = P(top_i) * P(bottom_j)
    combo_scores = (top_vals.unsqueeze(1) * bot_vals.unsqueeze(0))  # (k_top, k_bot)

    # flatten 후 TOP-K 조합 선택
    flat_scores = combo_scores.flatten()
    k_combo = min(combo_topk, flat_scores.numel())

    best_scores, best_flat_idx = torch.topk(flat_scores, k=k_combo)

    # flat index -> (i, j) 복원
    i_idx = best_flat_idx // k_bot
    j_idx = best_flat_idx %  k_bot

    # 실제 클래스 인덱스
    best_top_class_idx = top_idx[i_idx].detach().cpu().numpy()
    best_bot_class_idx = bot_idx[j_idx].detach().cpu().numpy()

    # 라벨 문자열로 변환
    best_top_labels = le_top.inverse_transform(best_top_class_idx)
    best_bot_labels = le_bottom.inverse_transform(best_bot_class_idx)

    # 결과: (상의라벨, 하의라벨, 점수, P(top), P(bottom))
    results = []
    for t_lbl, b_lbl, s, pt, pb in zip(
        best_top_labels.tolist(),
        best_bot_labels.tolist(),
        best_scores.detach().cpu().numpy().tolist(),
        top_vals[i_idx].detach().cpu().numpy().tolist(),
        bot_vals[j_idx].detach().cpu().numpy().tolist(),
    ):
        results.append((t_lbl, b_lbl, float(s), float(pt), float(pb)))

    return results

# =========================
# 5) 예시 실행
# =========================
if __name__ == "__main__":
    combos = recommend_combo(weather_code=1, temperature=5.0, wind_speed=3.2,
                             top_k_each=5, combo_topk=10)
    print("TOP 조합 추천(상의, 하의, 점수=Ptop*Pbottom, Ptop, Pbottom):")
    for row in combos:
        print(row)
