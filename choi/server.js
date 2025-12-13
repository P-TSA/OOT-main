const fs = require('fs');
const ejs = require('ejs');
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');

// MySQL DB 연결
const client = mysql.createConnection({
  host: 'localhost',      // DB서버 IP주소
  port: 3306,             // DB접속 포트
  user: 'dbid253',        // DB접속 아이디 (학교에서 부여)
  password: 'dbpass253',  // DB암호 (학교에서 부여)
  database: 'db25320'     // 사용할 DB명 (팀 계정, 팀 정보로 수정/설정 할 것!)
});

// 서버를 생성합니다.
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// 서버를 실행합니다.
app.listen(65027, function () {
  console.log('웹서버 실행중...');
  console.log('회원조회: http://ceprj2.gachon.ac.kr:65027/members');
  console.log('회원가입: http://ceprj2.gachon.ac.kr:65027/signup');
  console.log('회원가입 API: http://ceprj2.gachon.ac.kr:65027/api/auth/signup');
  console.log('로그인 API: http://ceprj2.gachon.ac.kr:65027/api/auth/login');
  console.log('옷정보 저장: http://ceprj2.gachon.ac.kr:65027/api/outfit/save');
  console.log('옷정보 조회(전체): http://ceprj2.gachon.ac.kr:65027/api/outfit/all');
  console.log('옷정보 조회(개인): http://ceprj2.gachon.ac.kr:65027/api/outfit/:userId');
  console.log('AI 추천: http://ceprj2.gachon.ac.kr:65027/api/ai/recommendation');
});

// 라우트를 수행합니다.
app.get('/members', (request, response) => {
  fs.readFile('views/list.ejs', 'utf8', (error, data) => { // List보면
    // 데이터베이스 쿼리를 실행합니다.
    client.query('SELECT * FROM userdata', (error, results) => {
      // 응답합니다.
      response.send(ejs.render(data, {
        data: results
      }));
    });
  });
});

app.post('/insert', function (request, response) {
  let body = request.body;

  console.log(body.name);
  console.log(body.uid);
  console.log(body.pass);

  client.query('INSERT INTO userdata (name, uid, pass) VALUES (?, ?, ?)',
    [body.name, body.uid, body.pass], () => {
      console.log("Insertion into DB was completed !");
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<meta charset="utf-8"> 가입완료! <a href="http://ceprj2.gachon.ac.kr:60020/members">회원조회</a>');
    });

});

// 회원가입 API (JSON 응답)
app.post('/api/auth/signup', (request, response) => {
  let body = request.body;

  // 입력값 검증
  if (!body.id || !body.password || !body.name || !body.age || !body.gender) {
    return response.status(400).json({
      success: false,
      message: '모든 필드를 입력해주세요'
    });
  }

  // 아이디 중복 확인
  client.query('SELECT id FROM users WHERE id = ?', [body.id], (error, results) => {
    if (results.length > 0) {
      return response.status(409).json({
        success: false,
        message: '이미 존재하는 아이디입니다'
      });
    }

    // 사용자 정보 저장
    client.query(
      'INSERT INTO users (id, password, name, age, gender, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [body.id, body.password, body.name, parseInt(body.age), body.gender],
      (error) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다'
          });
        }

        return response.status(201).json({
          success: true,
          message: '회원가입이 완료되었습니다'
        });
      }
    );
  });
});

// 로그인 API
app.post('/api/auth/login', (request, response) => {
  let body = request.body;

  if (!body.id || !body.password) {
    return response.status(400).json({
      success: false,
      message: 'ID와 비밀번호를 입력해주세요'
    });
  }

  client.query(
    'SELECT user_id, id, name FROM users WHERE id = ? AND password = ?',
    [body.id, body.password],
    (error, results) => {
      if (results.length === 0) {
        return response.status(401).json({
          success: false,
          message: 'ID 또는 비밀번호가 잘못되었습니다'
        });
      }

      return response.status(200).json({
        success: true,
        message: '로그인 성공',
        user: {
          user_id: results[0].user_id,
          id: results[0].id,
          name: results[0].name
        }
      });
    }
  );
});

// 옷 정보 저장 API
app.post('/api/outfit/save', (request, response) => {
  let body = request.body;

  if (!body.userId || !body.top || !body.bottom) {
    return response.status(400).json({
      success: false,
      message: '모든 필드를 입력해주세요'
    });
  }

  // users 테이블에서 사용자가 존재하는지 확인
  client.query('SELECT id FROM users WHERE id = ?', [body.userId], (error, results) => {
    if (results.length === 0) {
      return response.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    // userdata 테이블에 옷 정보 INSERT 또는 UPDATE
    client.query(
      'INSERT INTO userdata (ID, top, bottom, temperature, weather_code, temperature_max, temperature_min, wind_speed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE top = ?, bottom = ?, temperature = ?, weather_code = ?, temperature_max = ?, temperature_min = ?, wind_speed = ?, created_at = NOW()',
      [body.userId, body.top, body.bottom, body.temperature, body.weather_code, body.temperature_max, body.temperature_min, body.wind_speed, body.top, body.bottom, body.temperature, body.weather_code, body.temperature_max, body.temperature_min, body.wind_speed],
      (error) => {
        if (error) {
          return response.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다',
            error: error.message
          });
        }

        return response.status(201).json({
          success: true,
          message: '옷 정보가 저장되었습니다'
        });
      }
    );
  });
});

// AI 추천 옷차림 조회 API
app.get('/api/ai/recommendation', (request, response) => {
  client.query(
    'SELECT id, top, bottom FROM aianswer ORDER BY RAND() LIMIT 1',
    (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다',
        });
      }

      if (results.length === 0) {
        return response.status(404).json({
          success: false,
          message: '추천 옷차림이 없습니다',
        });
      }

      return response.status(200).json({
        success: true,
        data: {
          id: results[0].id,
          top: results[0].top,
          bottom: results[0].bottom,
        },
      });
    }
  );
});

// 모든 사용자의 옷 정보 조회 API (특정 사용자 조회보다 먼저)
app.get('/api/outfit/all', (request, response) => {
  client.query(
    'SELECT ID, top, bottom, temperature, weather_code, temperature_max, temperature_min, wind_speed, created_at FROM userdata ORDER BY created_at DESC',
    (error, results) => {
      if (error) {
        return response.status(500).json({
          success: false,
          message: '서버 오류가 발생했습니다',
        });
      }

      return response.status(200).json({
        success: true,
        data: results,
      });
    }
  );
});

// 사용자의 옷 정보 조회 API
app.get('/api/outfit/:userId', (request, response) => {
  let userId = request.params.userId;

  client.query(
    'SELECT ID, top, bottom, temperature, weather_code, temperature_max, temperature_min, wind_speed, created_at FROM userdata WHERE ID = ? ORDER BY created_at DESC',
    [userId],
    (error, results) => {
      if (results.length === 0) {
        return response.status(404).json({
          success: false,
          message: '저장된 옷 정보가 없습니다'
        });
      }

      return response.status(200).json({
        success: true,
        data: results
      });
    }
  );
});