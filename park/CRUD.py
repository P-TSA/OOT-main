### 아직 테스트 안해봄 ###

import pymysql

class Users:
    def __init__(self, host, user, password, db):
        self.conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            db=db,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )

    def create_user(self, ID, password, nickname, age=None, gender=None):
        sql = "INSERT INTO users (ID, password, nickname, age, gender) VALUES (%s, %s, %s, %s, %s)"
        with self.conn.cursor() as cursor:
            cursor.execute(sql, (ID, password, nickname, age, gender))
        self.conn.commit()
        return cursor.lastrowid

    def read_user(self, user_id):
        sql = "SELECT * FROM users WHERE user_id = %s"
        with self.conn.cursor() as cursor:
            cursor.execute(sql, (user_id,))
            return cursor.fetchone()

    def update_user(self, user_id, **kwargs):
        fields = ", ".join([f"{k} = %s" for k in kwargs])
        sql = f"UPDATE users SET {fields} WHERE user_id = %s"
        values = list(kwargs.values()) + [user_id]
        with self.conn.cursor() as cursor:
            cursor.execute(sql, values)
        self.conn.commit()

    def delete_user(self, user_id):
        sql = "DELETE FROM users WHERE user_id = %s"
        with self.conn.cursor() as cursor:
            cursor.execute(sql, (user_id,))
        self.conn.commit()


class SoleUser:
    def __init__(self, host, user, password, db, user_id):
        self.conn = pymysql.connect(
            host=host,
            user=user,
            password=password,
            db=db,
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )
        self.table = f"user_table_{user_id}"

    def create(self, top, bottom):
        sql = f"INSERT INTO {self.table} (top, bottom) VALUES (%s, %s)"
        with self.conn.cursor() as cursor:
            cursor.execute(sql, (top, bottom))
        self.conn.commit()

    def read_all(self):
        sql = f"SELECT * FROM {self.table}"
        with self.conn.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()

    def update(self, row_id, **kwargs):
        fields = ", ".join([f"{k} = %s" for k in kwargs])
        sql = f"UPDATE {self.table} SET {fields} WHERE id = %s"
        values = list(kwargs.values()) + [row_id]
        with self.conn.cursor() as cursor:
            cursor.execute(sql, values)
        self.conn.commit()

    def delete(self, row_id):
        sql = f"DELETE FROM {self.table} WHERE id = %s"
        with self.conn.cursor() as cursor:
            cursor.execute(sql, (row_id,))
        self.conn.commit()


if __name__ == "__main__":
    import pymysql

    conn = pymysql.connect(
        host="localhost",
        user="dbid253",
        password="dbpass253",
        db="db25320",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

    while True:
        try:
            query = input("SQL> ")
            if query.lower() in ("exit", "quit"):
                break
            with conn.cursor() as cursor:
                cursor.execute(query)
                if query.strip().lower().startswith("select"):
                    print(cursor.fetchall())
                conn.commit()
        except Exception as e:
            print("Error:", e)
