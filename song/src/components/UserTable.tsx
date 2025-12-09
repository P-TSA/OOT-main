import { MoreVertical, Eye, EyeOff } from 'lucide-react';
import { User } from '../data/users';
import { useState } from 'react';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-4 text-gray-400 text-sm">이름</th>
            <th className="text-left p-4 text-gray-400 text-sm">이메일</th>
            <th className="text-left p-4 text-gray-400 text-sm">비밀번호</th>
            <th className="text-left p-4 text-gray-400 text-sm">성별</th>
            <th className="text-left p-4 text-gray-400 text-sm">나이</th>
            <th className="text-left p-4 text-gray-400 text-sm">마지막 접속</th>{/* 수정: 가입일에서 마지막 접속으로 변경 */}
            <th className="text-left p-4 text-gray-400 text-sm">상태</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              <td className="p-4 text-white">{user.name}</td>
              <td className="p-4 text-gray-400 text-sm">{user.email}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm font-mono">
                    {visiblePasswords[user.id] ? user.password : maskPassword(user.password)}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(user.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {visiblePasswords[user.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  user.gender === '남성' ? 'bg-blue-500/20 text-blue-400' : 
                  user.gender === '여성' ? 'bg-pink-500/20 text-pink-400' : 
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {user.gender}
                </span>
              </td>
              <td className="p-4 text-gray-400 text-sm">{user.age}세</td>
              <td className="p-4 text-gray-400 text-sm">{user.lastAccess}</td>{/* 수정: joinDate에서 lastAccess로 변경 */}
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded text-sm ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {user.status === 'active' ? '활성' : '대기중'}
                </span>
              </td>
              <td className="p-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}