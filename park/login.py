import pymysql

# -----------------------------
# 로그인 함수
# -----------------------------
def login(userid, password):
    conn = None
    cursor = None

    try:
        conn = pymysql.connect(
            host="localhost",
            user="dbid253",
            password="dbpass253",
            db="db25320",
            charset="utf8mb4"
        )
        cursor = conn.cursor()

        # 1) ID, password 확인
        sql = """
            SELECT user_id, password 
            FROM users 
            WHERE ID = %s
        """
        cursor.execute(sql, (userid,))
        result = cursor.fetchone()

        if result is None:
            print("존재하지 않는 ID입니다.")
            return False

        user_id, db_password = result

        if password != db_password:
            print("비밀번호가 일치하지 않습니다.")
            return False

        print(f"로그인 성공. user_id = {user_id}")

        # 2) 로그인 성공 시 user_table_{user_id} 구조 출력
        desc_sql = f"DESC user_table_{user_id};"
        cursor.execute(desc_sql)
        table_info = cursor.fetchall()

        print(f"user_table_{user_id} 테이블 구조:")
        for row in table_info:
            print(row)

        return True

    except Exception as e:
        print("오류 발생:", e)
        return False

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



# -----------------------------
# main 테스트
# -----------------------------
if __name__ == "__main__":
    print("=== 로그인 테스트 ===")

    user_id = input("ID 입력: ").strip()
    password = input("비밀번호 입력: ").strip()

    login(user_id, password)