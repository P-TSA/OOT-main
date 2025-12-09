import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../data/users';

interface AgeChartProps {
  users: User[];
}

export function AgeChart({ users }: AgeChartProps) {
  // 나이대별 그룹화 (10대, 20대, 30대, 40대 등)
  const getAgeGroup = (age: number): string => {
    const decade = Math.floor(age / 10) * 10;
    return `${decade}대`;
  };

  const ageCounts = users.reduce((acc, user) => {
    const ageGroup = getAgeGroup(user.age);
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 데이터 정렬 (10대, 20대, 30대 순서로)
  const data = Object.entries(ageCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const numA = parseInt(a.name);
      const numB = parseInt(b.name);
      return numA - numB;
    });

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <h3 className="text-white text-lg mb-4">연령대별 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af' }}
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
          <Bar 
            dataKey="value" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="사용자 수"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}