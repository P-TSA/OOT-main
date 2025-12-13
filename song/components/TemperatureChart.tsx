import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { getWeeklyForecast } from '../src/services/openMeteoApi';

export function TemperatureChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getWeeklyForecast('서울');
        
        // API 데이터를 차트 형식으로 변환
        const formattedData = data.map((item) => {
          const [year, month, day] = item.date.split('-');
          return {
            date: `${month}/${day}`,
            최고: item.maxTemp,
            최저: item.minTemp,
            평균: Math.round((item.maxTemp + item.minTemp) / 2),
          };
        });
        
        setChartData(formattedData);
      } catch (error) {
        console.error('온도 차트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center h-[368px]">
          <div className="text-gray-400">차트 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">7일 온도 추이</h3>
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