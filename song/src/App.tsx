import { Users, Activity, UserCheck, Calendar, Download, Search, Filter, ChevronDown } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { StatsCard } from './components/StatsCard';
import { UserTable } from './components/UserTable';
import { users } from './data/users';

export default function App() {
  return (
    <div className="flex h-screen bg-[#151922] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-white text-2xl mb-2">사용자 관리</h1>
              <p className="text-gray-400">전체 사용자 등록 및 활동 내역</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              사용자 데이터 내보내기
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="전체 사용자" value="12,453" icon={Users} iconColor="text-blue-400" />
            <StatsCard title="활성 사용자" value="8,234" icon={Activity} iconColor="text-green-400" />
            <StatsCard title="대기중 사용자" value="4,219" icon={UserCheck} iconColor="text-gray-400" />
            <StatsCard title="신규 (7일)" value="253" icon={Calendar} iconColor="text-purple-400" />
          </div>

          {/* Search and Filter */}
          <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="사용자 검색 (이름, 이메일)..."
                className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
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
          <UserTable users={users} />
        </div>
      </main>
    </div>
  );
}
