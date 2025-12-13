import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';

export function WeatherCard({ weather }) {
  // Open-Meteo API에서 온 아이콘 사용 (있으면), 아니면 기본 아이콘 사용
  const weatherIcons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  
  const icon = weather.icon || weatherIcons[weather.weather] || '☁️';

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
      {/* 도시 이름 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-xl">{weather.city}</h3>
          <p className="text-gray-400 text-sm">{weather.cityEn}</p>
        </div>
        <div className="text-5xl">{icon}</div>
      </div>

      {/* 온도 */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-4xl">{weather.temp}°</span>
          <span className="text-gray-400">체감 {weather.feels_like}°</span>
        </div>
        <p className="text-blue-400 mt-1">{weather.weatherKr || weather.weather}</p>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">습도</p>
            <p className="text-white">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">풍속</p>
            <p className="text-white">{weather.wind_speed} m/s</p>
          </div>
        </div>
      </div>
    </div>
  );
}