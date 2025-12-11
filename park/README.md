## DB 접속방법
```sql
mysql -u dbid253 -p
enter password: dbpass253
use db25320
show tables;
```

## column 보는법
```sql
desc [테이블이름];
```

## signup.py 사용법
1. 실사용  
```py
from signup import *
signup(ID, password, nickname, age, gender)
```
2. 테스트용
```
python3 signup.py
```

## login.py 사용법
1. 실사용
```py
from login import *
login(ID, password)
```
2. 테스트용
```
python signup.py
```

## 테스트 데이터 넣는 SQL문  
insert into users (ID, password, nickname, age, gender) values ('아이디', '비밀번호', '닉네임', 20, 1);  
insert into user_table_1 (top, bottom) values ('상의', '하의');

유저 개인 테이블 생성하는 SQL문
```sql
create table user_table_N ( -- N을 다른 숫자로 바꿀 것
id int auto_increment primary key,
top varchar(20) not null,
bottom varchar(20) not null,
weather varchar(20),
temp float,
wind_speed float,
created_at datetime default current_timestamp
);
```

### DESC users;
```
+------------+-------------+------+-----+---------------------+----------------+  
| Field      | Type        | Null | Key | Default             | Extra          |  
+------------+-------------+------+-----+---------------------+----------------+  
| user_id    | int(11)     | NO   | PRI | NULL                | auto_increment |  
| ID         | varchar(20) | NO   | UNI | NULL                |                |  
| password   | varchar(50) | NO   |     | NULL                |                |  
| nickname   | varchar(20) | NO   |     | NULL                |                |  
| age        | int(11)     | YES  |     | NULL                |                |  
| gender     | varchar(10) | YES  |     | NULL                |                |  
| created_at | datetime    | YES  |     | current_timestamp() |                |  
+------------+-------------+------+-----+---------------------+----------------+  
```

### DESC user_table_1;
```
+------------+-------------+------+-----+---------------------+----------------+  
| Field      | Type        | Null | Key | Default             | Extra          |  
+------------+-------------+------+-----+---------------------+----------------+  
| id         | int(11)     | NO   | PRI | NULL                | auto_increment |  
| top        | varchar(20) | NO   |     | NULL                |                |  
| bottom     | varchar(20) | NO   |     | NULL                |                |  
| weather    | varchar(20) | YES  |     | NULL                |                |  
| temp       | float       | YES  |     | NULL                |                |  
| wind_speed | float       | YES  |     | NULL                |                |  
| created_at | datetime    | YES  |     | current_timestamp() |                |  
+------------+-------------+------+-----+---------------------+----------------+  
```