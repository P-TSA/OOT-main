import pymysql
import pandas as pd

conn = pymysql.connect(
    host="localhost",        # 내부 실행이므로 OK
    user="dbid253",
    password="여기에_실제비번",
    db="db25320",
    charset="utf8mb4"
)

query = "SELECT * FROM users;"
df = pd.read_sql(query, conn)

print(df)

conn.close()