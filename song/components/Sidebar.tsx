import { Shield, Users, Cloud, Bot, Database } from 'lucide-react'; // LogOut 제거

export function Sidebar({ currentPage, setCurrentPage }) { // 추가: props 받기
  return (
    <aside className="w-64 bg-[#1a1f2e] border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white">관리자 대시보드</h1>
            <p className="text-xs text-gray-400">Admin Control Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="mb-4 px-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-500">정상 작동 중</span>
          </div>
          <p className="text-xs text-gray-500">모든 시스템이 정상 작동 중</p>
        </div>

        {/* 메뉴 버튼들 */}
        <div className="space-y-3">
          {/* 날씨 모니터링 버튼 */}
          <button
            onClick={() => setCurrentPage('weather')}
            className={`w-full p-4 rounded-lg transition-all flex items-start gap-3 ${
              currentPage === 'weather'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Cloud className="w-5 h-5 mt-0.5" />
            <div className="text-left">
              <div>날씨 모니터링</div>
              <div className="text-xs opacity-90 mt-1">주요 도시별 날씨 정보 및 통계</div>
            </div>
          </button>

          {/* 사용자 관리 버튼 */}
          <button
            onClick={() => setCurrentPage('users')}
            className={`w-full p-4 rounded-lg transition-all flex items-start gap-3 ${
              currentPage === 'users'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5 mt-0.5" />
            <div className="text-left">
              <div>사용자 관리</div>
              <div className="text-xs opacity-90 mt-1">전체 사용자 목록 및 활동 내역</div>
            </div>
          </button>

          {/* 데이터처리 버튼 */}
          <button
            onClick={() => setCurrentPage('data')}
            className={`w-full p-4 rounded-lg transition-all flex items-start gap-3 ${
              currentPage === 'data'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Database className="w-5 h-5 mt-0.5" />
            <div className="text-left">
              <div>데이터처리</div>
              <div className="text-xs opacity-90 mt-1">데이터 분석 및 처리 현황</div>
            </div>
          </button>

          {/* AI 점검 및 확인 버튼 */}
          <button
            onClick={() => setCurrentPage('ai')}
            className={`w-full p-4 rounded-lg transition-all flex items-start gap-3 ${
              currentPage === 'ai'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Bot className="w-5 h-5 mt-0.5" />
            <div className="text-left">
              <div>AI 점검 및 확인</div>
              <div className="text-xs opacity-90 mt-1">AI 시스템 상태 및 성능 모니터링</div>
            </div>
          </button>
        </div>
      </nav>
    </aside>
  );
}