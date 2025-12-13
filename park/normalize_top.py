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
# 변환 규칙
# -----------------------------
TOP_MAPPING = {
    "패딩": "패딩",
    "롱패딩": "패딩",
    "야상": "재킷",
    "롱코트": "코트",
    "더블 코트": "코트",
    "숏패딩": "패딩",
    "무스탕": "재킷",
    "오리털 점퍼": "패딩",
    "누빔 점퍼": "패딩",
    "반팔티": "반팔 티셔츠",
    "누빔 코트": "코트",
    "코트": "코트",
    "패딩 조끼": "패딩",
    "구스다운 점퍼": "패딩",
    "구스다운 코트": "코트",
    "다운 자켓": "패딩",
    "반팔 셔츠": "반팔 티셔츠",
    "민소매": "반팔 티셔츠",
    "오버핏 패딩": "패딩",
    "티셔츠": "긴팔 티셔츠",
    "오리털 롱패딩": "패딩",
    "패딩조끼": "패딩",
    "후드 집업": "후드 집업",
    "맨투맨": "맨투맨/스웨트",
    "바람막이": "가디건",
    "폴로셔츠": "셔츠/블라우스",
    "오버사이즈 패딩": "패딩",
    "가디건": "가디건",
    "긴팔티": "긴팔 티셔츠",
    "니트": "니트/스웨터",
    "나시티": "반팔 티셔츠",
    "데님 자켓": "재킷",
    "구스다운 패딩": "패딩",
    "후드티": "후드",
    "롱 무스탕": "코트",
    "블레이저": "재킷",
    "울 롱코트": "코트",
    "울 코트": "코트",
    "코치자켓": "재킷",
    "패딩 야상": "패딩",
    "패딩 코트": "패딩",
    "린넨 반팔셔츠": "반팔 티셔츠",
    "셔츠": "셔츠/블라우스",
    "자켓": "재킷",
    "긴팔 셔츠": "셔츠/블라우스",
    "린넨 셔츠": "셔츠/블라우스",
    "블루종": "가디건",
    "얇은 가디건": "가디건",
    "울 가디건": "가디건",
    "트렌치코트": "코트",
    "MA-1 야상": "재킷",
    "가죽 자켓": "재킷",
    "가죽자켓": "재킷",
    "긴팔 맨투맨": "맨투맨",
    "다운 재킷": "재킷",
    "롱 코트": "코트",
    "린넨 티셔츠": "셔츠/블라우스",
    "린넨티": "셔츠/블라우스",
    "바람막이 자켓": "가디건",
    "바람막이 점퍼": "가디건",
    "얇은 자켓": "재킷",
    "후드": "후드"
}

# -----------------------------
# 메인 로직
# -----------------------------
def create_and_normalize():
    conn = None
    cursor = None

    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # 1) 기존 테이블 복사 (구조 + 데이터)
        print("테이블 복사 중...")
        cursor.execute(f"DROP TABLE IF EXISTS {TARGET_TABLE}")
        cursor.execute(
            f"CREATE TABLE {TARGET_TABLE} LIKE {SOURCE_TABLE}"
        )
        cursor.execute(
            f"INSERT INTO {TARGET_TABLE} SELECT * FROM {SOURCE_TABLE}"
        )

        # 2) 복사된 테이블에서만 변환 수행
        update_sql = f"""
            UPDATE {TARGET_TABLE}
            SET top = %s
            WHERE top = %s
        """

        total = 0
        for old, new in TOP_MAPPING.items():
            affected = cursor.execute(update_sql, (new, old))
            total += affected
            print(f"[변환] {old} → {new} ({affected}건)")

        conn.commit()
        print(f"\n정규화 완료: 총 {total}건 변경")

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
    create_and_normalize()
