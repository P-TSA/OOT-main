import pymysql

# -----------------------------
# 회원가입 함수
# -----------------------------
def signup(userid, password, nickname, age=None, gender=None):
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

        # 1) ID 중복 검사
        check_sql = "SELECT COUNT(*) FROM users WHERE ID = %s"
        cursor.execute(check_sql, (userid,))
        count = cursor.fetchone()[0]

        if count > 0:
            print("이미 존재하는 ID입니다.")
            return False

        # 2) INSERT 진행
        insert_sql = """
            INSERT INTO users (ID, password, nickname, age, gender)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (userid, password, nickname, age, gender))
        conn.commit()

        # 3) auto_increment user_id 가져오기
        user_id = cursor.lastrowid
        print(f"회원가입 성공. 부여된 user_id = {user_id}")

        # 4) 개인 테이블 생성 (user_table_{user_id})
        create_table_sql = f"""
            CREATE TABLE user_table_{user_id} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                top varchar(20) not null,
                bottom varchar(20) not null,
                weather varchar(20),
                temp float,
                wind_speed float,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_table_sql)
        conn.commit()

        print(f"user_table_{user_id} 테이블이 생성되었습니다.")
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
    print("=== 회원가입 ===")

    # 필수 입력: ID, 비밀번호, 닉네임
    user_id = input("ID 입력: ").strip()
    password = input("비밀번호 입력: ").strip()
    nickname = input("닉네임 입력: ").strip()

    # 나이는 정수로
    age_input = input("나이 입력 (없으면 Enter): ").strip()
    if age_input == "":
        age = None
    else:
        age = int(age_input)

    gender_input = input("성별 입력 (없으면 Enter): ").strip()
    gender = gender_input if gender_input != "" else None

    signup(user_id, password, nickname, age, gender)
