import { Gauge, Eye, Droplet, Wind, Thermometer, Cloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDetailedWeather } from '../src/services/openMeteoApi';

const uvLevels = {
  0: { level: '낮음', color: '#10b981' },
  1: { level: '낮음', color: '#10b981' },
  2: { level: '낮음', color: '#10b981' },
  3: { level: '보통', color: '#f59e0b' },
  4: { level: '보통', color: '#f59e0b' },
  5: { level: '보통', color: '#f59e0b' },
  6: { level: '높음', color: '#ef4444' },
  7: { level: '높음', color: '#ef4444' },
  8: { level: '매우높음', color: '#dc2626' },
  9: { level: '매우높음', color: '#dc2626' },
  10: { level: '위험', color: '#991b1b' },
};

export function DetailedMetrics() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Open-Meteo API에서 상세 날씨 데이터 가져오기
  useEffect(() => {
    const loadDetailedWeather = async () => {
      setLoading(true);
      try {
        const data = await getDetailedWeather('서울');
        setWeatherData(data);
      } catch (error) {
        console.error('상세 날씨 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedWeather();
  }, []);

  // 풍향을 방위로 변환
  const getWindDirection = (deg) => {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  if (loading || !weatherData) {
    return (
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">세부 기상 정보 로딩 중...</div>
        </div>
      </div>
    );
  }

  const uvInfo = uvLevels[weatherData.uv_index] || uvLevels[0];

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">세부 기상 정보</h3>
        <p className="text-gray-400 text-sm">서울 현재 상세 날씨 지표 (Open-Meteo API)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 체감온도 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <span className="text-gray-400 text-sm">체감온도</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.feels_like}°C</p>
          <p className="text-gray-500 text-xs">실제 {weatherData.temp}°C</p>
        </div>

        {/* 습도 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">습도</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.humidity}%</p>
          <p className="text-gray-500 text-xs">
            {weatherData.humidity > 70 ? '높음' : weatherData.humidity > 40 ? '보통' : '낮음'}
          </p>
        </div>

        {/* 기압 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">기압</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.pressure}</p>
          <p className="text-gray-500 text-xs">hPa</p>
        </div>

        {/* 가시거리 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400 text-sm">가시거리</span>
          </div>
          <p className="text-white text-2xl mb-1">{(weatherData.visibility / 1000).toFixed(1)}</p>
          <p className="text-gray-500 text-xs">km</p>
        </div>

        {/* 풍속/풍향 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">풍속/풍향</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.wind_speed} m/s</p>
          <p className="text-gray-500 text-xs">{getWindDirection(weatherData.wind_deg)} ({weatherData.wind_deg}°)</p>
        </div>

        {/* UV 지수 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 text-yellow-400">☀️</div>
            <span className="text-gray-400 text-sm">UV 지수</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.uv_index}</p>
          <p className="text-xs" style={{ color: uvInfo.color }}>{uvInfo.level}</p>
        </div>

        {/* 이슬점 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-5 h-5 text-teal-400" />
            <span className="text-gray-400 text-sm">이슬점</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.dew_point}°C</p>
          <p className="text-gray-500 text-xs">결로점</p>
        </div>

        {/* 구름량 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">구름량</span>
          </div>
          <p className="text-white text-2xl mb-1">{weatherData.clouds}%</p>
          <p className="text-gray-500 text-xs">
            {weatherData.clouds < 20 ? '맑음' : weatherData.clouds < 50 ? '구름조금' : weatherData.clouds < 85 ? '구름많음' : '흐림'}
          </p>
        </div>
      </div>
    </div>
  );
}