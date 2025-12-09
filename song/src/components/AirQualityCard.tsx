import { Wind, Activity } from 'lucide-react';
import { airQualityData } from '../data/weatherData';

export function AirQualityCard() {
  const getAqiColor = (aqi) => {
    if (aqi <= 50) return '#10b981'; // 좋음
    if (aqi <= 100) return '#f59e0b'; // 보통
    if (aqi <= 150) return '#ef4444'; // 나쁨
    return '#dc2626'; // 매우나쁨
  };

  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return '좋음';
    if (aqi <= 100) return '보통';
    if (aqi <= 150) return '나쁨';
    return '매우나쁨';
  };

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Wind className="w-5 h-5 text-blue-400" />
          <h3 className="text-white text-lg">대기질</h3>
        </div>
        <p className="text-gray-400 text-sm">서울 실시간 대기 상태</p>
      </div>

      {/* AQI 메인 표시 */}
      <div className="mb-6 text-center">
        <div
          className="inline-block px-6 py-8 rounded-2xl mb-3"
          style={{ backgroundColor: `${getAqiColor(airQualityData.aqi)}20` }}
        >
          <div
            className="text-5xl mb-2"
            style={{ color: getAqiColor(airQualityData.aqi) }}
          >
            {airQualityData.aqi}
          </div>
          <div
            className="text-sm"
            style={{ color: getAqiColor(airQualityData.aqi) }}
          >
            {getAqiLevel(airQualityData.aqi)}
          </div>
        </div>
        <p className="text-gray-400 text-sm">Air Quality Index</p>
      </div>

      {/* 세부 오염물질 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">PM2.5</p>
          <p className="text-white text-lg">{airQualityData.pm25}</p>
          <p className="text-gray-500 text-xs">μg/m³</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">PM10</p>
          <p className="text-white text-lg">{airQualityData.pm10}</p>
          <p className="text-gray-500 text-xs">μg/m³</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">O₃</p>
          <p className="text-white text-lg">{airQualityData.o3}</p>
          <p className="text-gray-500 text-xs">ppb</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">NO₂</p>
          <p className="text-white text-lg">{airQualityData.no2}</p>
          <p className="text-gray-500 text-xs">ppb</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">SO₂</p>
          <p className="text-white text-lg">{airQualityData.so2}</p>
          <p className="text-gray-500 text-xs">ppb</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">CO</p>
          <p className="text-white text-lg">{airQualityData.co}</p>
          <p className="text-gray-500 text-xs">ppm</p>
        </div>
      </div>
    </div>
  );
}
