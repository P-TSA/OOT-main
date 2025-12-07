import { Shield, ChevronDown, LogOut } from 'lucide-react';

export function Sidebar() {
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
        <div className="mb-4">
          <button className="w-full flex items-center justify-between p-3 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-sm">시스템 선택</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 px-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-500">정상 작동 중</span>
          </div>
          <p className="text-xs text-gray-500">모든 시스템이 정상 작동 중</p>
        </div>

        <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
          <div>사용자 관리</div>
          <div className="text-xs opacity-90 mt-1">전체 사용자 목록 및 활동 내역</div>
        </button>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
