import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { User } from '../data/users';

interface GenderChartProps {
  users: User[];
}

export function GenderChart({ users }: GenderChartProps) {
  // 성별 데이터 집계
  const genderCounts = users.reduce((acc, user) => {
    acc[user.gender] = (acc[user.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: '남성', value: genderCounts['남성'] || 0, color: '#3b82f6' },
    { name: '여성', value: genderCounts['여성'] || 0, color: '#ec4899' },
    { name: '기타', value: genderCounts['기타'] || 0, color: '#a855f7' },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <h3 className="text-white text-lg mb-4">성별 분포</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}