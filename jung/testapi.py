import requests
from datetime import datetime
import sys
import io

# stdout을 UTF-8로 명시적 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Windows 환경에서 UTF-8 출력 설정
if sys.platform == "win32":
    import os
    os.system("chcp 65001 > nul")

# ============================
# 0) weather_code → 한국어 설명 매핑
# ============================
weather_code_map = {
    0: "맑음",
    1: "대체로 맑음",
    2: "부분적으로 흐림",
    3: "흐림",
    45: "안개",
    48: "서리 안개",
    51: "이슬비 (약)",
    53: "이슬비 (중간)",
    55: "이슬비 (강)",
    56: "어는 이슬비 (약)",
    57: "어는 이슬비 (강)",
    61: "비 (약)",
    63: "비 (중간)",
    65: "비 (강)",
    66: "어는 비 (약)",
    67: "어는 비 (강)",
    71: "눈 (약)",
    73: "눈 (중간)",
    75: "눈 (강)",
    77: "눈날림",
    80: "소나기 (약)",
    81: "소나기 (중간)",
    82: "소나기 (강)",
    85: "소낙눈 (약/중간)",
    86: "소낙눈 (강)",
    95: "천둥번개",
    96: "천둥번개 + 약한 우박",
    99: "천둥번개 + 강한 우박",
}

# 1) 현재 위치 확인 (IP 기반)
loc_url = "https://ipinfo.io/json"
loc_data = requests.get(loc_url).json()

loc = loc_data["loc"].split(",")
lat = float(loc[0])
lon = float(loc[1])

city_en = loc_data.get("city", "")
region_en = loc_data.get("region", "")
country_en = loc_data.get("country", "")

# 1-1) 영어 지역명을 Geocoding API로 한글 지역명으로 변환
geo_url = "https://geocoding-api.open-meteo.com/v1/search"
geo_params = {
    "name": city_en,
    "language": "ko"
}
geo_data = requests.get(geo_url, params=geo_params).json()

if "results" in geo_data and len(geo_data["results"]) > 0:
    city_ko = geo_data["results"][0]["name"]
else:
    city_ko = city_en  # 실패 시 영어 그대로

print("당신의 현재 위치:")
print(f"위도: {lat}")
print(f"경도: {lon}")
print(f"지역: {city_ko}")
print()

# 2) 현재 시각 정각 만들기
now = datetime.now()
closest_hour = now.replace(minute=0, second=0, microsecond=0)
closest_hour_str = closest_hour.strftime("%Y-%m-%dT%H:00")
today_str = closest_hour.strftime("%Y-%m-%d")

# 3) Open-Meteo API 호출
weather_url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": lat,
    "longitude": lon,
    "hourly": "temperature_2m,wind_speed_10m,weather_code",
    "daily": "temperature_2m_max,temperature_2m_min",
    "timezone": "Asia/Seoul"
}

weather_data = requests.get(weather_url, params=params).json()

# 4) 시간별 데이터
times = weather_data["hourly"]["time"]
temps = weather_data["hourly"]["temperature_2m"]
winds = weather_data["hourly"]["wind_speed_10m"]
w_codes = weather_data["hourly"]["weather_code"]

# 현재 시각 index 찾기
idx = times.index(closest_hour_str)
current_temp = temps[idx]
current_wind = winds[idx]
current_wcode = w_codes[idx]
current_wdesc = weather_code_map.get(current_wcode, "알 수 없는 날씨")

# 5) 오늘 최고/최저 기온
daily_times = weather_data["daily"]["time"]
daily_tmax = weather_data["daily"]["temperature_2m_max"]
daily_tmin = weather_data["daily"]["temperature_2m_min"]

day_idx = daily_times.index(today_str)
today_tmax = daily_tmax[day_idx]
today_tmin = daily_tmin[day_idx]

# 6) 출력
print("현재 시각:", now.strftime("%Y-%m-%d %H:%M"))
print("가장 가까운 정각:", closest_hour_str)
print()

print("=== 현재 날씨 정보 ===")
print(f"현재 온도: {current_temp} °C")
print(f"현재 풍속: {current_wind} m/s")
print(f"현재 날씨 코드: {current_wcode} ({current_wdesc})")
print()

print("=== 오늘 일별 정보 ===")
print(f"오늘 날짜: {today_str}")
print(f"오늘 최고 기온: {today_tmax} °C")
print(f"오늘 최저 기온: {today_tmin} °C")