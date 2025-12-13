import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  // 서버 URL 설정 (가천대학교 팀프로젝트 서버)
  static const String baseUrl = 'http://ceprj2.gachon.ac.kr:65027/api';

  // 회원가입
  static Future<Map<String, dynamic>> signup({
    required String id,
    required String password,
    required String name,
    required int age,
    required String gender,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': id,
          'password': password,
          'name': name,
          'age': age,
          'gender': gender,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': jsonDecode(response.body)['message'],
        };
      } else if (response.statusCode == 409) {
        return {
          'success': false,
          'message': '이미 존재하는 아이디입니다',
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '회원가입 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // 로그인
  static Future<Map<String, dynamic>> login({
    required String id,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'id': id,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'user': data['user'],
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '로그인 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // 옷 정보 저장
  static Future<Map<String, dynamic>> saveOutfit({
    required String userId,
    required String top,
    required String bottom,
    required double temperature,
    required int weatherCode,
    required double temperatureMax,
    required double temperatureMin,
    required double windSpeed,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/outfit/save'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': userId,
          'top': top,
          'bottom': bottom,
          'temperature': temperature,
          'weather_code': weatherCode,
          'temperature_max': temperatureMax,
          'temperature_min': temperatureMin,
          'wind_speed': windSpeed,
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return {
          'success': true,
          'message': jsonDecode(response.body)['message'],
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '저장 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // 사용자의 옷 정보 조회
  static Future<Map<String, dynamic>> getOutfits(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/outfit/$userId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '조회 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // 모든 사용자의 옷 정보 조회
  static Future<Map<String, dynamic>> getAllOutfits() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/outfit/all'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '조회 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // AI 추천 옷차림 조회
  static Future<Map<String, dynamic>> getAiRecommendation() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ai/recommendation'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? '조회 실패',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }

  // 헬스체크
  static Future<Map<String, dynamic>> getHealth() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      return {
        'success': response.statusCode == 200,
      };
    } catch (e) {
      return {
        'success': false,
        'message': '서버 연결 오류: $e',
      };
    }
  }
}