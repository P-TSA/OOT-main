import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User } from '../data/users';

interface LastAccessChartProps {
  users: User[];
}

export function LastAccessChart({ users }: LastAccessChartProps) {
  // 현재 시간과 마지막 접속 시간의 차이를 계산 (일 단위)
  const calculateDaysAgo = (lastAccess: string): number => {
    const now = new Date('2025-12-06 17:00'); // 기준 시간
    const accessTime = new Date(lastAccess);
    const diffMs = now.getTime() - accessTime.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 미접속 기간별로 사용자 분류
  const categorizeUsers = () => {
    const categories = {
      '1일 미접속': 0,
      '3일 미접속': 0,
      '1주일 미접속': 0,
      '1개월 미접속': 0,
    };

    users.forEach(user => {
      const daysAgo = calculateDaysAgo(user.lastAccess);
      
      if (daysAgo >= 30) {
        categories['1개월 미접속']++;
      } else if (daysAgo >= 7) {
        categories['1주일 미접속']++;
      } else if (daysAgo >= 3) {
        categories['3일 미접속']++;
      } else if (daysAgo >= 1) {
        categories['1일 미접속']++;
      }
    });

    return categories;
  };

  const categories = categorizeUsers();
  const data = Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));

  // 카테고리별 색상
  const getBarColor = (name: string): string => {
    if (name === '1일 미접속') return '#10b981'; // 초록색
    if (name === '3일 미접속') return '#f59e0b'; // 주황색
    if (name === '1주일 미접속') return '#f97316'; // 진한 주황색
    return '#ef4444'; // 빨간색
  };

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <h3 className="text-white text-lg mb-4">미접속 기간별 사용자 현황</h3>
      <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-400">1일 미접속</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-gray-400">3일 미접속</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-600"></div>
          <span className="text-gray-400">1주일 미접속</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-400">1개월 미접속</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
            label={{ value: '사용자 수', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            allowDecimals={false}
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
            formatter={(value: number) => [`${value}명`, '사용자 수']}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}