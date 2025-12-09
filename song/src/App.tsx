import { Search, Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { UserTable } from './components/UserTable';
import { GenderChart } from './components/GenderChart';
import { AgeChart } from './components/AgeChart';
import { LastAccessChart } from './components/LastAccessChart';
import { WeatherPage } from './components/WeatherPage'; // 추가: 날씨 페이지
import { AIMonitoring } from './components/AIMonitoring'; // 추가: AI 점검 페이지
import { users } from './data/users';

export default function App() {
  const [currentPage, setCurrentPage] = useState('weather'); // 수정: 기본 페이지를 날씨로 변경
  const [searchQuery, setSearchQuery] = useState(''); // 검색 입력값 state
  const [actualSearchQuery, setActualSearchQuery] = useState(''); // 실제 적용되는 검색어

  // Enter 키 핸들러
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setActualSearchQuery(searchQuery);
    }
  };

  // 검색 필터링 함수 (actualSearchQuery 사용)
  const filteredUsers = users.filter(user => {
    const query = actualSearchQuery.toLowerCase();
    if (!query) return true; // 검색어가 없으면 모든 사용자 표시
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

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
              <div>
                <h1 className="text-white text-2xl mb-2">사용자 관리</h1>
                <p className="text-gray-400">전체 사용자 등록 및 활동 내역</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <GenderChart users={users} />
              <AgeChart users={users} />
            </div>

            {/* Last Access Chart */}
            <div className="mb-8">
              <LastAccessChart users={users} />
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
                <button className="text-gray-400 hover:text-white transition-colors p-2">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg">
                  <span>전체 상태</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Table */}
            <UserTable users={filteredUsers} />
          </div>
        ) : currentPage === 'weather' ? (
          <WeatherPage />
        ) : currentPage === 'ai' ? (
          <AIMonitoring />
        ) : null}
      </main>
    </div>
  );
}