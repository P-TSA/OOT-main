## DB 만들었음

DB 접속방법
mysql -u dbid253 -p
enter password: dbpass253
use db25320
show tables;

레이블 보는법
desc [테이블이름];

테스트 데이터 넣는 SQL문
insert into users (ID, password, nickname, age, gender) values ('아이디', '비밀번호', '닉네임', 20, 1);

insert into user_table_1 (top, bottom) values ('상의', '하의');


유저 개인 테이블 생성하는 SQL문
create table user_table_N ( // N을 다른 숫자로 바꿀 것
id int auto_increment primary key,
top varchar(20) not null,
bottom varchar(20) not null,
weather varchar(20),
temp float,
wind_speed float,
created_at datetime default current_timestamp
);

## signup.py 만들었음
사용방법
signup.py 내부에는 signup(userid, password, nickname, age, gender) 함수가 있는데
여기다 데이터 넣으면 알아서 잘 해줌(?)
테스트해보고 싶으면 원격접속으로 python3 signup.py 하면 됩니다(서버에 파일 넣어놓음)