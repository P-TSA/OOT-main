import { weeklyForecast, weatherIcons } from '../data/weatherData';
import { CloudRain } from 'lucide-react';

export function WeeklyForecast({ selectedDate, onDateSelect }) {
  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">7일 예보</h3>
        <p className="text-gray-400 text-sm">서울 기준 주간 날씨 전망</p>
      </div>

      {/* 가로 정렬 7일 예보 */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-2">
          {weeklyForecast.map((day, index) => {
            const icon = weatherIcons[day.weather] || '☁️';
            const isSelected = selectedDate === day.date;
            const isToday = index === 0;
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect(day.date)}
                className={`flex flex-col items-center p-4 rounded-xl min-w-[120px] transition-all ${
                  isSelected 
                    ? 'bg-blue-600 shadow-lg scale-105' 
                    : 'bg-gray-800/50 hover:bg-gray-800'
                }`}
              >
                {/* 날짜와 요일 */}
                <div className="mb-3 text-center">
                  {isToday ? (
                    <p className="text-blue-400 mb-1">오늘</p>
                  ) : (
                    <p className={`mb-1 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {day.day}요일
                    </p>
                  )}
                  <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    {day.date.split('/')[1]}일
                  </p>
                </div>

                {/* 날씨 아이콘 */}
                <div className="text-4xl mb-3">{icon}</div>

                {/* 최고/최저 온도 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${isSelected ? 'text-red-300' : 'text-red-400'}`}>
                    {day.high}°
                  </span>
                  <span className={`${isSelected ? 'text-blue-200' : 'text-blue-400'}`}>
                    {day.low}°
                  </span>
                </div>

                {/* 강수확률 */}
                <div className="flex items-center gap-1">
                  <CloudRain className={`w-4 h-4 ${
                    isSelected 
                      ? 'text-blue-200' 
                      : day.precipitation > 50 
                        ? 'text-blue-400' 
                        : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isSelected 
                      ? 'text-blue-200' 
                      : day.precipitation > 50 
                        ? 'text-blue-400' 
                        : 'text-gray-500'
                  }`}>
                    {day.precipitation}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}