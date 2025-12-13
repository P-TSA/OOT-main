import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:geolocator/geolocator.dart';

class WeatherService {
  static const String openMeteoUrl = 'https://api.open-meteo.com/v1/forecast';

  // 현재 위치 기반 날씨 정보 조회
  static Future<Map<String, dynamic>> getCurrentWeather() async {
    try {
      // 위치 권한 확인
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        return {
          'success': false,
          'message': '위치 권한이 필요합니다',
        };
      }

      // 현재 위치 가져오기
      final Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Open-Meteo API 호출
      final response = await http.get(
        Uri.parse(
          '$openMeteoUrl?latitude=${position.latitude}&longitude=${position.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Seoul',
        ),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': {
            'temperature': data['current']['temperature_2m'],
            'weather_code': data['current']['weather_code'],
            'wind_speed': data['current']['wind_speed_10m'],
            'temperature_max': data['daily']['temperature_2m_max'][0],
            'temperature_min': data['daily']['temperature_2m_min'][0],
          },
        };
      } else {
        return {
          'success': false,
          'message': '날씨 정보를 불러올 수 없습니다',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': '날씨 로드 오류: $e',
      };
    }
  }

  // 날씨 코드를 설명으로 변환
  static String getWeatherDescription(int code) {
    final weatherCodeMap = {
      0: '맑음',
      1: '대체로 맑음',
      2: '부분적으로 흐림',
      3: '흐림',
      45: '안개',
      48: '서리 안개',
      51: '이슬비 (약)',
      53: '이슬비 (중간)',
      55: '이슬비 (강)',
      56: '어는 이슬비 (약)',
      57: '어는 이슬비 (강)',
      61: '비 (약)',
      63: '비 (중간)',
      65: '비 (강)',
      66: '어는 비 (약)',
      67: '어는 비 (강)',
      71: '눈 (약)',
      73: '눈 (중간)',
      75: '눈 (강)',
      77: '눈날림',
      80: '소나기 (약)',
      81: '소나기 (중간)',
      82: '소나기 (강)',
      85: '소낙눈 (약/중간)',
      86: '소낙눈 (강)',
      95: '천둥번개',
      96: '천둥번개 + 약한 우박',
      99: '천둥번개 + 강한 우박',
    };
    return weatherCodeMap[code] ?? '맑음';
  }

  // 날씨 코드를 이모지로 변환
  static String getWeatherEmoji(int code) {
    if (code == 0) return '☀️';
    if (code == 1) return '🌤️';
    if (code == 2) return '⛅';
    if (code == 3) return '☁️';
    if (code == 45 || code == 48) return '🌫️';
    if (code >= 51 && code <= 57) return '🌧️';
    if (code >= 61 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '⛈️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '☀️';
  }
}