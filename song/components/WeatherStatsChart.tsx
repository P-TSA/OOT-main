import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { getAllCitiesWeather } from '../src/services/openMeteoApi';

export function WeatherStatsChart() {
  const [chartData, setChartData] = useState([]);
  const [weatherCount, setWeatherCount] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getAllCitiesWeather();
        
        // 날씨 상태별 카운트
        const count = {};
        data.forEach((item) => {
          const weatherKr = item.weatherKr;
          count[weatherKr] = (count[weatherKr] || 0) + 1;
        });

        const formattedData = Object.keys(count).map((key) => ({
          name: key,
          value: count[key],
        }));

        setWeatherCount(count);
        setChartData(formattedData);
      } catch (error) {
        console.error('날씨 통계 차트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
          <p className="text-white text-xl">{(weatherCount['맑음'] || 0) + (weatherCount['대체로 맑음'] || 0)}개 도시</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">흐림</p>
          <p className="text-white text-xl">{(weatherCount['부분적으로 흐림'] || 0) + (weatherCount['흐림'] || 0)}개 도시</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">눈/비</p>
          <p className="text-white text-xl">{Object.keys(weatherCount).filter(key => key.includes('눈') || key.includes('비')).reduce((sum, key) => sum + (weatherCount[key] || 0), 0)}개 도시</p>
        </div>
      </div>
    </div>
  );
}