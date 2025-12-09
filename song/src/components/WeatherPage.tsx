import { useState, useEffect } from 'react';
import { RefreshCw, Cloud, AlertTriangle, Clock } from 'lucide-react';
import { WeatherCard } from './WeatherCard';
import { TemperatureChart } from './TemperatureChart';
import { WeatherStatsChart } from './WeatherStatsChart';
import { HourlyForecast } from './HourlyForecast';
import { WeeklyForecast } from './WeeklyForecast'; // 추가: 주간 예보
import { AirQualityCard } from './AirQualityCard'; // 추가: 대기질
import { SunriseSunsetCard } from './SunriseSunsetCard'; // 추가: 일출/일몰
import { DetailedMetrics } from './DetailedMetrics'; // 추가: 세부 지표
import { currentWeatherData, weatherStats } from '../data/weatherData';

export function WeatherPage() {
  const [weatherData, setWeatherData] = useState(currentWeatherData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('12/08'); // 선택된 날짜 상태 추가
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1초마다 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 날씨 데이터 새로고침 함수
  const refreshWeather = async () => {
    setIsLoading(true);
    
    // 실제 API 호출 예시 (현재는 mock 데이터 사용)
    /*
    try {
      const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
      const cities = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'];
      
      const promises = cities.map(city => 
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`)
          .then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      setWeatherData(results);
    } catch (error) {
      console.error('날씨 데이터 불러오기 실패:', error);
    }
    */

    // Mock 데이터 새로고침 시뮬레이션
    setTimeout(() => {
      setWeatherData(currentWeatherData);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl mb-2">날씨 모니터링</h1>
            <p className="text-gray-400">전국 주요 도시 실시간 날씨 정보</p>
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

      {/* API 안내 카드 */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-blue-300 mb-1">날씨 API 연동 안내</h3>
          <p className="text-blue-200 text-sm">
            현재 Mock 데이터를 사용 중입니다. 실제 날씨 데이터를 받으려면{' '}
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              OpenWeatherMap API
            </a>
            에서 API 키를 발급받아 <code className="bg-blue-950 px-2 py-0.5 rounded">WeatherPage.tsx</code> 파일의 
            <code className="bg-blue-950 px-2 py-0.5 rounded ml-1">YOUR_OPENWEATHERMAP_API_KEY</code> 부분을 교체하세요.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 온도</p>
          <p className="text-white text-2xl">{weatherStats.avgTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">최고 온도</p>
          <p className="text-red-400 text-2xl">{weatherStats.maxTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">최저 온도</p>
          <p className="text-blue-400 text-2xl">{weatherStats.minTemp}°C</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 습도</p>
          <p className="text-white text-2xl">{weatherStats.avgHumidity}%</p>
        </div>
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">평균 풍속</p>
          <p className="text-white text-2xl">{weatherStats.avgWindSpeed} m/s</p>
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