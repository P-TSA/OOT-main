import { Gauge, Eye, Droplet, Wind, Thermometer, Cloud } from 'lucide-react';
import { currentWeatherData, uvLevels } from '../data/weatherData';

export function DetailedMetrics() {
  // 서울 데이터 사용
  const seoulWeather = currentWeatherData.find(city => city.city === '서울');
  
  if (!seoulWeather) return null;

  const uvInfo = uvLevels[seoulWeather.uv_index] || uvLevels[0];

  // 풍향을 방위로 변환
  const getWindDirection = (deg) => {
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">세부 기상 정보</h3>
        <p className="text-gray-400 text-sm">서울 현재 상세 날씨 지표</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 체감온도 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-5 h-5 text-orange-400" />
            <span className="text-gray-400 text-sm">체감온도</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.feels_like}°C</p>
          <p className="text-gray-500 text-xs">실제 {seoulWeather.temp}°C</p>
        </div>

        {/* 습도 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">습도</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.humidity}%</p>
          <p className="text-gray-500 text-xs">
            {seoulWeather.humidity > 70 ? '높음' : seoulWeather.humidity > 40 ? '보통' : '낮음'}
          </p>
        </div>

        {/* 기압 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">기압</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.pressure}</p>
          <p className="text-gray-500 text-xs">hPa</p>
        </div>

        {/* 가시거리 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400 text-sm">가시거리</span>
          </div>
          <p className="text-white text-2xl mb-1">{(seoulWeather.visibility / 1000).toFixed(1)}</p>
          <p className="text-gray-500 text-xs">km</p>
        </div>

        {/* 풍속/풍향 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">풍속/풍향</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.wind_speed} m/s</p>
          <p className="text-gray-500 text-xs">{getWindDirection(seoulWeather.wind_deg)} ({seoulWeather.wind_deg}°)</p>
        </div>

        {/* UV 지수 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 text-yellow-400">☀️</div>
            <span className="text-gray-400 text-sm">UV 지수</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.uv_index}</p>
          <p className="text-xs" style={{ color: uvInfo.color }}>{uvInfo.level}</p>
        </div>

        {/* 이슬점 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Droplet className="w-5 h-5 text-teal-400" />
            <span className="text-gray-400 text-sm">이슬점</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.dew_point}°C</p>
          <p className="text-gray-500 text-xs">결로점</p>
        </div>

        {/* 구름량 */}
        <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">구름량</span>
          </div>
          <p className="text-white text-2xl mb-1">{seoulWeather.clouds}%</p>
          <p className="text-gray-500 text-xs">
            {seoulWeather.clouds < 20 ? '맑음' : seoulWeather.clouds < 50 ? '구름조금' : seoulWeather.clouds < 85 ? '구름많음' : '흐림'}
          </p>
        </div>
      </div>
    </div>
  );
}
