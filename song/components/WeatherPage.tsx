import { useState, useEffect } from 'react';
import { RefreshCw, Cloud, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { TemperatureChart } from './TemperatureChart';
import { WeatherStatsChart } from './WeatherStatsChart';
import { HourlyForecast } from './HourlyForecast';
import { WeeklyForecast } from './WeeklyForecast';
import { AirQualityCard } from './AirQualityCard';
import { SunriseSunsetCard } from './SunriseSunsetCard';
import { DetailedMetrics } from './DetailedMetrics';
import { getAllCitiesWeather } from '../src/services/openMeteoApi';

export function WeatherPage() {
  const [weatherData, setWeatherData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('12/08');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState('loading'); // 'loading', 'connected', 'error'

  // 1초마다 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 컴포넌트 마운트 시 Open-Meteo API에서 데이터 가져오기
  useEffect(() => {
    loadWeatherData();
  }, []);

  // Open-Meteo API에서 날씨 데이터 가져오기
  const loadWeatherData = async () => {
    setIsLoading(true);
    setApiStatus('loading');
    
    try {
      const data = await getAllCitiesWeather();
      setWeatherData(data);
      setLastUpdated(new Date());
      setApiStatus('connected');
    } catch (error) {
      console.error('Open-Meteo API 오류:', error);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // 날씨 데이터 새로고침 함수
  const refreshWeather = async () => {
    await loadWeatherData();
  };

  // 평균 통계 계산
  const calculateStats = () => {
    if (weatherData.length === 0) {
      return { avgTemp: 0, maxTemp: 0, minTemp: 0, avgHumidity: 0, avgWindSpeed: 0 };
    }

    const temps = weatherData.map(w => w.temp);
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgHumidity = Math.round(weatherData.reduce((a, b) => a + b.humidity, 0) / weatherData.length);
    const avgWindSpeed = (weatherData.reduce((a, b) => a + b.wind_speed, 0) / weatherData.length).toFixed(1);

    return { avgTemp, maxTemp, minTemp, avgHumidity, avgWindSpeed };
  };

  const stats = calculateStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl mb-2">날씨 모니터링</h1>
            <p className="text-gray-400">전국 주요 도시 실시간 날씨 정보 (Open-Meteo API)</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 현재 시간 표시 */}
            <div className="flex items-center gap-2 bg-[#1e2534] border border-gray-700 rounded-lg px-4 py-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <div className="text-white">
                {currentTime.toLocaleDateString('ko-KR', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'short' 
                })}
                <span className="ml-2 text-blue-400">
                  {currentTime.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <button
              onClick={refreshWeather}
              disabled={isLoading}
              className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
        </p>
      </div>

      {/* API 상태 카드 */}
      <div className={`border rounded-xl p-4 mb-6 flex items-start gap-3 ${
        apiStatus === 'connected' 
          ? 'bg-green-900/20 border-green-700' 
          : apiStatus === 'error'
          ? 'bg-red-900/20 border-red-700'
          : 'bg-blue-900/20 border-blue-700'
      }`}>
        {apiStatus === 'connected' ? (
          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
        ) : (
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${apiStatus === 'error' ? 'text-red-400' : 'text-blue-400'}`} />
        )}
        <div className="flex-1">
          <h3 className={`${apiStatus === 'connected' ? 'text-green-300' : apiStatus === 'error' ? 'text-red-300' : 'text-blue-300'}`}>
            {apiStatus === 'connected' ? 'Open-Meteo API 연결됨' : apiStatus === 'error' ? 'API 연결 오류' : 'API 연결 중...'}
          </h3>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 온도</p>
          <p className="text-white text-2xl">{stats.avgTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">최고 온도</p>
          <p className="text-red-400 text-2xl">{stats.maxTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">최저 온도</p>
          <p className="text-blue-400 text-2xl">{stats.minTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 습도</p>
          <p className="text-white text-2xl">{stats.avgHumidity}%</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 풍속</p>
          <p className="text-white text-2xl">{stats.avgWindSpeed} m/s</p>
        </div>
      </div>

      {/* 도시별 날씨 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {weatherData.map((weather) => (
          <WeatherCard key={weather.id} weather={weather} />
        ))}
      </div>

      {/* 주간 예보 */}
      <div className="mb-8">
        <WeeklyForecast selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      </div>

      {/* 시간별 예보 */}
      <div className="mb-8">
        <HourlyForecast selectedDate={selectedDate} />
      </div>

      {/* 세부 기상 정보 */}
      <div className="mb-8">
        <DetailedMetrics />
      </div>

      {/* 대기질 & 일출/일몰 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AirQualityCard />
        <SunriseSunsetCard />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureChart />
        <WeatherStatsChart />
      </div>
    </div>
  );
}