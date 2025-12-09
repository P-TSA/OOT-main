import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { currentWeatherData } from '../data/weatherData';

export function WeatherStatsChart() {
  // 날씨 상태별 카운트
  const weatherCount = {};
  currentWeatherData.forEach((item) => {
    const weatherKr = item.weatherKr;
    weatherCount[weatherKr] = (weatherCount[weatherKr] || 0) + 1;
  });

  const chartData = Object.keys(weatherCount).map((key) => ({
    name: key,
    value: weatherCount[key],
  }));

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">날씨 상태 분포</h3>
        <p className="text-gray-400 text-sm">전국 주요 도시 날씨 현황</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#1f2937',
              padding: '8px 12px'
            }}
            itemStyle={{
              color: '#1f2937'
            }}
            labelStyle={{
              color: '#1f2937',
              fontWeight: 'bold'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">맑음</p>
          <p className="text-white text-xl">{weatherCount['맑음'] || 0}개 도시</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">흐림</p>
          <p className="text-white text-xl">{(weatherCount['구름많음'] || 0) + (weatherCount['흐림'] || 0)}개 도시</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">비/눈</p>
          <p className="text-white text-xl">{weatherCount['비'] || 0}개 도시</p>
        </div>
      </div>
    </div>
  );
}