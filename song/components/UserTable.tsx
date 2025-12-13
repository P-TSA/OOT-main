import { Eye, EyeOff, BarChart3 } from 'lucide-react';
import { User } from '../App';
import { useState, useEffect } from 'react';
import { userdataAPI } from '../src/services/apiService';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  const [userDataCounts, setUserDataCounts] = useState<{ [key: string]: number }>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // 사용자별 데이터 개수 로드
  useEffect(() => {
    loadUserDataCounts();
  }, [users]);

  const loadUserDataCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const allData = await userdataAPI.getAll();
      const counts = allData.reduce((acc, item) => {
        acc[item.ID] = (acc[item.ID] || 0) + 1;
        return acc;
      }, {});
      setUserDataCounts(counts);
    } catch (error) {
      console.error('데이터 개수 로드 실패:', error);
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
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
            <th className="text-left p-4 text-gray-400 text-sm">이메일 (ID)</th>
            <th className="text-left p-4 text-gray-400 text-sm">비밀번호</th>
            <th className="text-left p-4 text-gray-400 text-sm">성별</th>
            <th className="text-left p-4 text-gray-400 text-sm">나이</th>
            <th className="text-left p-4 text-gray-400 text-sm">데이터 수</th>
            <th className="text-left p-4 text-gray-400 text-sm">가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-12 text-gray-400">
                사용자 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const dataCount = userDataCounts[user.email] || 0;
              return (
                <tr
                  key={user.id}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-4 text-white">{user.name}</td>
                  <td className="p-4 text-cyan-400 text-sm">{user.email}</td>
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
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        user.gender === '남성'
                          ? 'bg-blue-500/20 text-blue-400'
                          : user.gender === '여성'
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {user.gender}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{user.age}세</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span
                        className={`text-sm ${
                          dataCount > 0 ? 'text-cyan-400' : 'text-gray-500'
                        }`}
                      >
                        {isLoadingCounts ? '...' : `${dataCount}개`}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{user.lastAccess}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}