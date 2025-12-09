import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { forecastData } from '../data/weatherData';

export function TemperatureChart() {
  // 데이터 가공 - 날짜별로 그룹화하여 평균 온도 계산
  const chartData = [];
  const dateMap = {};

  forecastData.forEach((item) => {
    if (!dateMap[item.date]) {
      dateMap[item.date] = { temps: [], date: item.date };
    }
    dateMap[item.date].temps.push(item.temp);
  });

  Object.keys(dateMap).forEach((date) => {
    const temps = dateMap[date].temps;
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    chartData.push({
      date,
      평균: avgTemp,
      최고: maxTemp,
      최저: minTemp,
    });
  });

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">5일 온도 추이</h3>
        <p className="text-gray-400 text-sm">서울 기준 일별 최고/최저/평균 온도</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: '온도 (°C)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#f3f4f6', 
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#1f2937',
              padding: '8px 12px'
            }}
            labelStyle={{ 
              color: '#1f2937',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}
            itemStyle={{
              color: '#1f2937'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="최고" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="평균" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="최저" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}