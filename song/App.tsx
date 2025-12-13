import { useState, useEffect } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { UserTable } from './components/UserTable';
import { GenderChart } from './components/GenderChart';
import { AgeChart } from './components/AgeChart';
import { WeatherPage } from './components/WeatherPage';
import { AIMonitoring } from './components/AIMonitoring';
import { DataProcessing } from './components/DataProcessing';
import { userAPI } from './src/services/apiService';

// 사용자 데이터 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: '남성' | '여성' | '기타';
  age: number;
  lastAccess: string;
  status: 'active' | 'pending';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('weather');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]); // API에서 가져온 사용자 데이터
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 데이터 로드
  useEffect(() => {
    if (currentPage === 'users') {
      loadUsers();
    }
  }, [currentPage]);

  // 사용자 목록 로드 함수
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('사용자 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 처리
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    setIsLoading(true);
    try {
      const data = await userAPI.search(searchQuery);
      setFilteredUsers(data);
    } catch (error) {
      console.error('검색 실패:', error);
      // 검색 실패 시 로컬 필터링
      const filtered = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 초기화
  const handleResetSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  // Enter 키 핸들러
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex h-screen bg-[#151922] overflow-hidden">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentPage === 'users' ? (
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-white text-2xl mb-2">사용자 관리</h1>
                  <p className="text-gray-400">전체 사용자 등록 정보 (MariaDB 연동)</p>
                </div>
                <button
                  onClick={loadUsers}
                  disabled={isLoading}
                  className={`flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>새로고침</span>
                </button>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GenderChart users={filteredUsers} />
              <AgeChart users={filteredUsers} />
            </div>

            {/* Search and Filter */}
            <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="사용자 검색 (이름, 이메일)..."
                  className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSearch}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors px-4 py-2 bg-cyan-500/10 rounded-lg"
                  disabled={isLoading}
                >
                  검색
                </button>
                {searchQuery && (
                  <button
                    onClick={handleResetSearch}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                    disabled={isLoading}
                    title="검색 초기화"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* User Table */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                데이터를 불러오는 중...
              </div>
            ) : (
              <UserTable users={filteredUsers} />
            )}
          </div>
        ) : currentPage === 'weather' ? (
          <WeatherPage />
        ) : currentPage === 'ai' ? (
          <AIMonitoring />
        ) : currentPage === 'data' ? (
          <DataProcessing />
        ) : null}
      </main>
    </div>
  );
}