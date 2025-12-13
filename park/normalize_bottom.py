import pymysql

# -----------------------------
# DB 연결 정보
# -----------------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "dbid253",
    "password": "dbpass253",
    "db": "db25320",
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor
}

SOURCE_TABLE = "userdata"
TARGET_TABLE = "userdata_normalized"

# -----------------------------
# 하의 정규화 규칙
# -----------------------------
BOTTOM_MAPPING = {
    "면바지": "면바지",
    "청바지": "청바지",
    "기모바지": "면바지",
    "카고팬츠": "면바지",
    "기모 청바지": "청바지",
    "슬랙스": "슈트/슬랙스",
    "치노팬츠": "면바지",
    "조거팬츠": "트레이닝/조거 팬츠",
    "기모 슬랙스": "슈트/슬랙스",
    "반바지": "반바지",
    "면반바지": "반바지",
    "청반바지": "반바지",
    "기모 레깅스": "레깅스",
    "기모 조거팬츠": "트레이닝/조거 팬츠",
    "두꺼운 청바지": "청바지",
    "울 카고팬츠": "면바지",
    "치노 반바지": "반바지",
    "기모 스킨": "레깅스",
    "두꺼운 레깅스": "레깅스",
    "두꺼운 슬랙스": "슈트/슬랙스",
    "린넨 반바지": "반바지",
    "기모 카고팬츠": "면바지",
    "기모 팬츠": "면바지",
    "코듀로이 팬츠": "면바지",
    "코튼 반바지": "반바지",
    "기모 트레이닝팬츠": "트레이닝/조거 팬츠",
    "방한 팬츠": "면바지"
}

# -----------------------------
# 메인 로직
# -----------------------------
def create_and_normalize_bottom():
    conn = None
    cursor = None

    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1) 테이블 복사 (구조 + 데이터)
        print("하의 테이블 복사 중...")
        cursor.execute(f"DROP TABLE IF EXISTS {TARGET_TABLE}")
        cursor.execute(
            f"CREATE TABLE {TARGET_TABLE} LIKE {SOURCE_TABLE}"
        )
        cursor.execute(
            f"INSERT INTO {TARGET_TABLE} SELECT * FROM {SOURCE_TABLE}"
        )

        # 2) bottom 컬럼 정규화
        update_sql = f"""
            UPDATE {TARGET_TABLE}
            SET bottom = %s
            WHERE bottom = %s
        """

        total = 0
        for old, new in BOTTOM_MAPPING.items():
            affected = cursor.execute(update_sql, (new, old))
            total += affected
            print(f"[변환] {old} → {new} ({affected}건)")

        conn.commit()
        print(f"\n하의 정규화 완료: 총 {total}건 변경")

    except Exception as e:
        if conn:
            conn.rollback()
        print("오류 발생:", e)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# -----------------------------
# 실행
# -----------------------------
if __name__ == "__main__":
    create_and_normalize_bottom()
