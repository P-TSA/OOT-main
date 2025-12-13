# =========================
# 0) CUDA .so 경로 자동 보정 (torch import 전에!)
#    - libcusparseLt.so.0 를 site-packages/nvidia/.../lib 에서 찾는 케이스 대응
#    - LD_LIBRARY_PATH를 수정한 뒤, 현재 파이썬을 재실행(exec)해서 링커에 반영
# =========================
import os
import sys
import glob
import site

def _collect_nvidia_lib_dirs():
    lib_dirs = set()

    # site-packages 후보들(시스템/유저)
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

    # 많이 쓰이는 기본 경로도 보강
    sp_list.extend([
        "/usr/local/lib/python3.9/site-packages",
        "/usr/local/lib64/python3.9/site-packages",
        "/usr/lib/python3.9/site-packages",
        "/usr/lib64/python3.9/site-packages",
    ])

    # nvidia/<pkg>/lib, nvidia/<pkg>/lib64 수집
    for sp in sp_list:
        if not sp or not os.path.isdir(sp):
            continue
        for p in glob.glob(os.path.join(sp, "nvidia", "*", "lib")):
            if os.path.isdir(p):
                lib_dirs.add(p)
        for p in glob.glob(os.path.join(sp, "nvidia", "*", "lib64")):
            if os.path.isdir(p):
                lib_dirs.add(p)

    # 너가 찾은 cusparselt 경로는 특히 중요하니 직접 추가(있으면)
    hard = "/usr/local/lib/python3.9/site-packages/nvidia/cusparselt/lib"
    if os.path.isdir(hard):
        lib_dirs.add(hard)

    return sorted(lib_dirs)

def _patch_ld_library_path_and_reexec():
    # 무한 재실행 방지
    if os.environ.get("_LD_LIBRARY_PATH_PATCHED") == "1":
        return

    lib_dirs = _collect_nvidia_lib_dirs()
    if not lib_dirs:
        return

    old = os.environ.get("LD_LIBRARY_PATH", "")
    old_list = [p for p in old.split(":") if p]

    # 앞쪽에 후보 dir들을 붙여서 우선순위 확보
    new_list = []
    for d in lib_dirs:
        if d not in old_list and d not in new_list:
            new_list.append(d)
    new_list.extend(old_list)

    new = ":".join(new_list)

    # 변경이 있을 때만 재실행
    if new != old:
        os.environ["LD_LIBRARY_PATH"] = new
        os.environ["_LD_LIBRARY_PATH_PATCHED"] = "1"
        os.execv(sys.executable, [sys.executable] + sys.argv)

_patch_ld_library_path_and_reexec()

# =========================
# 기존 코드 (여기부터는 torch import OK)
# =========================
import pymysql
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# =========================
# 1. 설정
# =========================
BATCH_SIZE = 64
EPOCHS = 30
LR = 1e-3
RANDOM_SEED = 42

torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# =========================
# 2. DB에서 데이터 로드
# =========================
conn = pymysql.connect(
    host="localhost",
    user="dbid253",
    password="dbpass253",
    db="db25320",
    charset="utf8mb4"
)

query = """
SELECT
    weather_code,
    temperature,
    wind_speed,
    top,
    bottom
FROM userdata
WHERE top IS NOT NULL
  AND bottom IS NOT NULL;
"""
df = pd.read_sql(query, conn)
conn.close()

# =========================
# 3. 입력(X) / 출력(y) 구성
# =========================
X_weather = df["weather_code"].astype(int).values
X_num = df[["temperature", "wind_speed"]].astype(float).values

y_top = df["top"].astype(str).values
y_bottom = df["bottom"].astype(str).values

# =========================
# 4. 라벨 인코딩
# =========================
le_top = LabelEncoder()
le_bottom = LabelEncoder()

y_top_enc = le_top.fit_transform(y_top)
y_bottom_enc = le_bottom.fit_transform(y_bottom)

num_top_classes = len(le_top.classes_)
num_bottom_classes = len(le_bottom.classes_)

# =========================
# 5. Train/Val/Test split  ✅ (여기만 교체됨)
#    - stratify 실패(샘플 1개 클래스) 처리
#    - 샘플 1개짜리 클래스는 train에만 넣고,
#      나머지(2개 이상)만 stratify 적용
# =========================
idx = np.arange(len(df))
y_strat = y_top_enc  # stratify 기준: top

# 클래스별 카운트
counts = np.bincount(y_strat)
rare_classes = np.where(counts < 2)[0]  # 샘플 1개 클래스

rare_mask = np.isin(y_strat, rare_classes)
rare_idx = idx[rare_mask]        # 희귀 클래스 샘플
common_idx = idx[~rare_mask]     # 2개 이상 클래스 샘플

def safe_train_test_split(indices, test_size, seed, stratify_labels=None):
    """
    stratify_labels가 있고, 각 클래스가 최소 2개 이상일 때만 stratify 적용.
    아니면 일반 랜덤 split으로 fallback.
    """
    if stratify_labels is None:
        return train_test_split(indices, test_size=test_size, random_state=seed, shuffle=True)

    c = np.bincount(stratify_labels)
    if (c < 2).any():
        return train_test_split(indices, test_size=test_size, random_state=seed, shuffle=True)

    return train_test_split(
        indices,
        test_size=test_size,
        random_state=seed,
        shuffle=True,
        stratify=stratify_labels
    )

# (1) common만 stratify로 train/temp split
train_common, temp_common = safe_train_test_split(
    common_idx,
    test_size=0.3,
    seed=RANDOM_SEED,
    stratify_labels=y_strat[~rare_mask]
)

# (2) rare는 train에만 합류
train_idx = np.concatenate([train_common, rare_idx])

# train 섞기
rng = np.random.default_rng(RANDOM_SEED)
rng.shuffle(train_idx)

# (3) temp를 val/test로 split (가능하면 stratify, 아니면 랜덤)
val_idx, test_idx = safe_train_test_split(
    temp_common,
    test_size=0.5,
    seed=RANDOM_SEED,
    stratify_labels=y_strat[temp_common]
)

# =========================
# 6. 수치 입력 스케일링 (train 기준 mean/std)
# =========================
train_num = X_num[train_idx]
num_mean = train_num.mean(axis=0)
num_std = train_num.std(axis=0) + 1e-8

X_num_scaled = (X_num - num_mean) / num_std

# weather_code -> 연속 인덱스 매핑
unique_codes = np.unique(X_weather)
code_to_idx = {c: i for i, c in enumerate(unique_codes)}
X_weather_idx = np.array([code_to_idx[c] for c in X_weather], dtype=np.int64)
num_weather_codes = len(unique_codes)

# =========================
# 7. Dataset / DataLoader
# =========================
class ClothesDataset(Dataset):
    def __init__(self, w_idx, x_num, y_top, y_bottom, indices):
        self.w = w_idx[indices]
        self.x = x_num[indices]
        self.yt = y_top[indices]
        self.yb = y_bottom[indices]

    def __len__(self):
        return len(self.w)

    def __getitem__(self, i):
        return (
            torch.tensor(self.w[i], dtype=torch.long),
            torch.tensor(self.x[i], dtype=torch.float32),
            torch.tensor(self.yt[i], dtype=torch.long),
            torch.tensor(self.yb[i], dtype=torch.long),
        )

train_ds = ClothesDataset(X_weather_idx, X_num_scaled, y_top_enc, y_bottom_enc, train_idx)
val_ds   = ClothesDataset(X_weather_idx, X_num_scaled, y_top_enc, y_bottom_enc, val_idx)
test_ds  = ClothesDataset(X_weather_idx, X_num_scaled, y_top_enc, y_bottom_enc, test_idx)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False)
test_loader  = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False)

# =========================
# 8. GPU 디바이스 설정 (CPU 금지: cuda 없으면 중단)
# =========================
if not torch.cuda.is_available():
    raise RuntimeError("CUDA 사용 불가: torch.cuda.is_available() == False (CPU 사용 금지 조건)")

device = torch.device("cuda")
print("DEVICE:", device, "| GPU:", torch.cuda.get_device_name(0))

# =========================
# 9. 모델 정의 (공유 trunk + top/bottom head)
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
        out_top = self.head_top(z)
        out_bottom = self.head_bottom(z)
        return out_top, out_bottom

model = MultiHeadClothesNet(num_weather_codes, num_top_classes, num_bottom_classes).to(device)

# =========================
# 10. 학습 세팅
# =========================
crit = nn.CrossEntropyLoss()
opt = torch.optim.Adam(model.parameters(), lr=LR)

def eval_loader(loader):
    model.eval()
    top_correct = 0
    bottom_correct = 0
    n = 0
    with torch.no_grad():
        for w, x, yt, yb in loader:
            w, x, yt, yb = w.to(device), x.to(device), yt.to(device), yb.to(device)
            out_top, out_bottom = model(w, x)
            pred_top = out_top.argmax(dim=1)
            pred_bottom = out_bottom.argmax(dim=1)
            top_correct += (pred_top == yt).sum().item()
            bottom_correct += (pred_bottom == yb).sum().item()
            n += yt.size(0)
    return top_correct / n, bottom_correct / n

# =========================
# 11. 학습 루프
# =========================
best_val_sum = -1.0
for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0.0

    for w, x, yt, yb in train_loader:
        w, x, yt, yb = w.to(device), x.to(device), yt.to(device), yb.to(device)

        opt.zero_grad()
        out_top, out_bottom = model(w, x)

        loss_top = crit(out_top, yt)
        loss_bottom = crit(out_bottom, yb)
        loss = loss_top + loss_bottom

        loss.backward()
        opt.step()

        total_loss += loss.item()

    val_top_acc, val_bottom_acc = eval_loader(val_loader)
    train_top_acc, train_bottom_acc = eval_loader(train_loader)

    print(
        f"[{epoch:02d}/{EPOCHS}] "
        f"loss={total_loss/len(train_loader):.4f} | "
        f"train_top={train_top_acc:.3f} train_bottom={train_bottom_acc:.3f} | "
        f"val_top={val_top_acc:.3f} val_bottom={val_bottom_acc:.3f}"
    )

    val_sum = val_top_acc + val_bottom_acc
    if val_sum > best_val_sum:
        best_val_sum = val_sum
        torch.save(model.state_dict(), "clothes_multitask_gpu.pt")

# =========================
# 12. 최종 테스트 평가
# =========================
model.load_state_dict(torch.load("clothes_multitask_gpu.pt", map_location=device))
test_top_acc, test_bottom_acc = eval_loader(test_loader)
print("TEST top_acc:", round(test_top_acc, 4))
print("TEST bottom_acc:", round(test_bottom_acc, 4))

# =========================
# 13. 인코더/스케일 정보 저장
# =========================
joblib.dump(le_top, "top_label_encoder.pkl")
joblib.dump(le_bottom, "bottom_label_encoder.pkl")
joblib.dump(code_to_idx, "weather_code_to_idx.pkl")
joblib.dump({"num_mean": num_mean, "num_std": num_std}, "num_scaler.pkl")

print("✅ 저장 완료: 모델(.pt) + 인코더/스케일러(.pkl)")
