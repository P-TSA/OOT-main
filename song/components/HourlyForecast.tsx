import { CloudRain, Wind } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { getHourlyForecast } from '../src/services/openMeteoApi';

export function HourlyForecast({ selectedDate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1분마다 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Open-Meteo API에서 시간별 예보 가져오기
  useEffect(() => {
    const loadHourlyData = async () => {
      setLoading(true);
      try {
        // 7일치 시간별 예보 가져오기 (7 * 24 = 168시간)
        const data = await getHourlyForecast('서울', 168);
        
        console.log('⏰ HourlyForecast - 받은 시간별 데이터 개수:', data.length);
        
        // API 데이터를 UI 형식으로 변환
        const formattedData = data.map(item => {
          const date = new Date(item.time);
          const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
          const timeStr = `${String(date.getHours()).padStart(2, '0')}:00`;
          
          return {
            date: dateStr,
            time: timeStr,
            hour: date.getHours(),
            temp: item.temp,
            weather: item.icon,
            precipitation: item.precipitation,
            windSpeed: item.windSpeed,
          };
        });
        
        console.log('⏰ 변환된 시간별 데이터:', formattedData.length, '개');
        console.log('⏰ 날짜 범위:', formattedData[0]?.date, '~', formattedData[formattedData.length - 1]?.date);
        
        setHourlyData(formattedData);
      } catch (error) {
        console.error('시간별 예보 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHourlyData();
  }, []);

  // 선택된 날짜의 데이터만 필터링
  const todayForecast = useMemo(() => {
    const filtered = hourlyData.filter(item => item.date === selectedDate);
    console.log(`🔍 선택된 날짜: ${selectedDate}`);
    console.log(`🔍 필터링된 시간별 데이터 개수:`, filtered.length);
    if (filtered.length > 0) {
      console.log(`🔍 첫 데이터:`, filtered[0]);
      console.log(`🔍 마지막 데이터:`, filtered[filtered.length - 1]);
    } else {
      console.log(`❌ ${selectedDate}에 해당하는 데이터가 없습니다!`);
      console.log(`📋 사용 가능한 날짜들:`, [...new Set(hourlyData.map(item => item.date))]);
    }
    return filtered;
  }, [selectedDate, hourlyData]);

  // 현재 시간 확인
  const getCurrentHourIndex = () => {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    const currentHour = today.getHours();
    
    if (selectedDate === dateStr) {
      return todayForecast.findIndex(item => item.hour === currentHour);
    }
    return -1;
  };

  const currentHourIndex = getCurrentHourIndex();

  // 온도 범위 계산
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    if (todayForecast.length === 0) return { minTemp: 0, maxTemp: 20, tempRange: 20 };
    const temps = todayForecast.map(item => item.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return {
      minTemp: min,
      maxTemp: max,
      tempRange: max - min
    };
  }, [todayForecast]);

  // 온도를 높이 비율로 변환
  const getTempPosition = (temp) => {
    if (tempRange === 0) return 0.5;
    return 1 - ((temp - minTemp) / tempRange);
  };

  // SVG 경로 생성
  const generatePath = () => {
    if (todayForecast.length === 0) return '';
    const columnWidth = 70;
    const graphHeight = 60;
    const paddingTop = 20;
    const points = todayForecast.map((item, index) => {
      const x = index * columnWidth + columnWidth / 2;
      const y = getTempPosition(item.temp) * graphHeight + paddingTop;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  if (loading) {
    return (
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">시간별 예보 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (todayForecast.length === 0) {
    return (
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-white text-lg">시간별 예보</h3>
          <p className="text-gray-400 text-sm">서울 기준 48시간 날씨 예보</p>
        </div>
        <div className="text-gray-400 text-center py-8">선택한 날짜의 예보 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">시간별 예보</h3>
        <p className="text-gray-400 text-sm">서울 기준 48시간 날씨 예보 (Open-Meteo API)</p>
      </div>

      {/* 시간별 예보 - MSN 스타일 with 온도 그래프 */}
      <div className="overflow-x-auto">
        <div className="relative min-w-max">
          {/* 온도 그래프 영역 */}
          <div className="relative h-[100px] mb-4">
            <svg 
              width={todayForecast.length * 70} 
              height="100" 
              className="absolute top-0 left-0"
              style={{ overflow: 'visible' }}
            >
              {/* 온도 연결 선 */}
              <path
                d={generatePath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* 온도 포인트 및 텍스트 */}
              {todayForecast.map((item, index) => {
                const x = index * 70 + 35;
                const graphHeight = 60;
                const paddingTop = 20;
                const y = getTempPosition(item.temp) * graphHeight + paddingTop;
                return (
                  <g key={index}>
                    {/* 온도 점 */}
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      stroke="#1e2534"
                      strokeWidth="2"
                    />
                    {/* 온도 텍스트 */}
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="500"
                    >
                      {item.temp}°
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 시간대별 정보 */}
          <div className="flex gap-0 border-t border-gray-700">
            {todayForecast.map((item, index) => {
              const icon = item.weather;
              const isCurrentHour = index === currentHourIndex;
              
              return (
                <div 
                  key={index} 
                  className={`flex flex-col items-center py-4 px-3 min-w-[70px] border-r border-gray-700 hover:bg-gray-800/50 transition-colors ${
                    isCurrentHour ? 'bg-blue-900/20' : ''
                  }`}
                >
                  {/* 시간 */}
                  <div className="text-gray-400 text-xs mb-3 whitespace-nowrap">
                    {item.time === '00:00' && index !== 0 ? (
                      <div className="text-center">
                        <div className="text-gray-300">{item.date}</div>
                        <div>{item.time}</div>
                      </div>
                    ) : (
                      <div>{item.time}</div>
                    )}
                  </div>

                  {/* 날씨 아이콘 */}
                  <div className="text-3xl mb-3">{icon}</div>

                  {/* 강수확률 */}
                  <div className="flex items-center gap-1 mb-2">
                    <CloudRain className={`w-4 h-4 ${item.precipitation > 50 ? 'text-blue-400' : 'text-gray-600'}`} />
                    <span className={`text-xs ${item.precipitation > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
                      {item.precipitation}%
                    </span>
                  </div>

                  {/* 풍속 아이콘 */}
                  <div className="flex items-center gap-1">
                    <Wind className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4" />
          <span>강수확률</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <span>풍속</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <span>온도 추이</span>
        </div>
      </div>
    </div>
  );
}