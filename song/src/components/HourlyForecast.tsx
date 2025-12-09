import { forecastData, weatherIcons } from '../data/weatherData';
import { CloudRain, Wind } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

export function HourlyForecast({ selectedDate }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1분마다 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  // 선택된 날짜의 데이터만 필터링
  const todayForecast = useMemo(() => {
    return forecastData.filter(item => item.date === selectedDate);
  }, [selectedDate]);

  // 현재 시간 확인 (오늘 날짜와 시간이 일치하는지)
  const getCurrentHourIndex = () => {
    const today = new Date();
    const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    const currentHour = today.getHours();
    
    if (selectedDate === dateStr) {
      return todayForecast.findIndex(item => {
        const itemHour = parseInt(item.time.split(':')[0]);
        return itemHour === currentHour;
      });
    }
    return -1;
  };

  const currentHourIndex = getCurrentHourIndex();

  // 온도 범위 계산
  const { minTemp, maxTemp, tempRange } = useMemo(() => {
    const temps = todayForecast.map(item => item.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return {
      minTemp: min,
      maxTemp: max,
      tempRange: max - min
    };
  }, [todayForecast]);

  // 온도를 높이 비율로 변환 (0~1)
  const getTempPosition = (temp) => {
    if (tempRange === 0) return 0.5;
    return 1 - ((temp - minTemp) / tempRange); // 반전 (높은 온도가 위로)
  };

  // SVG 경로 생성 (온도 선 연결)
  const generatePath = () => {
    const columnWidth = 70;
    const graphHeight = 60; // 수정: 80에서 60으로 줄임 (padding 공간 확보)
    const paddingTop = 20; // 추가: 상단 여유 공간
    const points = todayForecast.map((item, index) => {
      const x = index * columnWidth + columnWidth / 2;
      const y = getTempPosition(item.temp) * graphHeight + paddingTop; // paddingTop 추가
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">시간별 예보</h3>
        <p className="text-gray-400 text-sm">서울 기준 48시간 날씨 예보</p>
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
                const graphHeight = 60; // 수정: 실제 그래프 높이
                const paddingTop = 20; // 추가: 상단 여유 공간
                const y = getTempPosition(item.temp) * graphHeight + paddingTop; // paddingTop 추가
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
              const icon = weatherIcons[item.weather] || '☁️';
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