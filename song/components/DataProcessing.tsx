import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  Shirt,
  Users,
  TrendingUp,
  Calendar,
  Search,
  X,
} from 'lucide-react';
import { userdataAPI } from '../src/services/apiService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function DataProcessing() {
  const [userdata, setUserdata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUserdata();
  }, []);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(userdata);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = userdata.filter(
        (item) =>
          item.ID?.toLowerCase().includes(query) ||
          item.user_name?.toLowerCase().includes(query) ||
          item.top?.toLowerCase().includes(query) ||
          item.bottom?.toLowerCase().includes(query)
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, userdata]);

  // 데이터 로드 함수
  const loadUserdata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userdataAPI.getAll();
      setUserdata(data);
      setFilteredData(data);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 날씨 코드 매핑
  const weatherCodeMap = {
    0: '맑음',
    1: '대체로 맑음',
    2: '부분 흐림',
    3: '흐림',
    45: '안개',
    48: '서리 안개',
    51: '가랑비',
    53: '보통 비',
    55: '강한 비',
    61: '약한 비',
    63: '보통 비',
    65: '강한 비',
    71: '약한 눈',
    73: '보통 눈',
    75: '강한 눈',
    95: '뇌우',
  };

  const getWeatherName = (code) => {
    return weatherCodeMap[code] || `코드 ${code}`;
  };

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 75) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  };

  // === 통계 계산 ===
  const stats = {
    total: userdata.length,
    uniqueUsers: new Set(userdata.map((item) => item.ID)).size,
    mostCommonTop: getMostCommon(userdata.map((item) => item.top)),
    mostCommonBottom: getMostCommon(userdata.map((item) => item.bottom)),
  };

  function getMostCommon(arr) {
    if (arr.length === 0) return '-';
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  // === 차트 데이터 ===

  // 1. 온도별 의류 선택 분석 (산점도)
  const temperatureClothingData = userdata.map((item) => ({
    온도: item.temperature,
    풍속: item.wind_speed,
    의류: `${item.top}/${item.bottom}`,
    날씨: getWeatherName(item.weather_code),
  }));

  // 2. 상의 분포 (파이 차트)
  const topDistribution = userdata.reduce((acc, item) => {
    acc[item.top] = (acc[item.top] || 0) + 1;
    return acc;
  }, {});

  const topChartData = Object.entries(topDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. 하의 분포 (파이 차트)
  const bottomDistribution = userdata.reduce((acc, item) => {
    acc[item.bottom] = (acc[item.bottom] || 0) + 1;
    return acc;
  }, {});

  const bottomChartData = Object.entries(bottomDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 4. 온도 추이 (라인 차트 - 최근 20개)
  const temperatureTrendData = userdata
    .slice(0, 20)
    .reverse()
    .map((item, index) => ({
      index: index + 1,
      온도: item.temperature,
      최고: item.temperature_max,
      최저: item.temperature_min,
      날짜: new Date(item.created_at).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  // 5. 날씨별 데이터 수 (바 차트)
  const weatherDistribution = userdata.reduce((acc, item) => {
    const weather = getWeatherName(item.weather_code);
    acc[weather] = (acc[weather] || 0) + 1;
    return acc;
  }, {});

  const weatherChartData = Object.entries(weatherDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 6. 온도 구간별 의류 선택
  const tempRanges = ['0°C 미만', '0-10°C', '10-20°C', '20°C 이상'];
  const clothingByTemp = userdata.reduce((acc, item) => {
    let range;
    if (item.temperature < 0) range = '0°C 미만';
    else if (item.temperature < 10) range = '0-10°C';
    else if (item.temperature < 20) range = '10-20°C';
    else range = '20°C 이상';

    if (!acc[range]) acc[range] = {};
    const clothing = `${item.top}/${item.bottom}`;
    acc[range][clothing] = (acc[range][clothing] || 0) + 1;
    return acc;
  }, {});

  // 차트 색상
  const COLORS = [
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#6366f1',
  ];

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-600">
          {payload.map((entry, index) => (
            <p key={index} className="text-white text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span> {entry.value}
              {entry.name.includes('온도') || entry.name.includes('최고') || entry.name.includes('최저')
                ? '°C'
                : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white">
            {data.name}: {data.value}회
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl mb-2">데이터 분석</h1>
            <p className="text-gray-400">사용자별 날씨 및 의류 데이터 종합 분석</p>
          </div>
          <button
            onClick={loadUserdata}
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

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <p className="text-gray-400 text-sm">총 데이터</p>
          </div>
          <p className="text-white text-3xl">{stats.total}개</p>
        </div>

        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <p className="text-gray-400 text-sm">사용자 수</p>
          </div>
          <p className="text-white text-3xl">{stats.uniqueUsers}명</p>
        </div>

        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shirt className="w-5 h-5 text-purple-400" />
            <p className="text-gray-400 text-sm">인기 상의</p>
          </div>
          <p className="text-white text-2xl">{stats.mostCommonTop}</p>
        </div>

        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shirt className="w-5 h-5 text-pink-400" />
            <p className="text-gray-400 text-sm">인기 하의</p>
          </div>
          <p className="text-white text-2xl">{stats.mostCommonBottom}</p>
        </div>
      </div>

      {/* 차트 영역 - 첫 번째 행 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 온도 추이 차트 */}
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <h3 className="text-white text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            온도 추이 (최근 20개)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="날짜" stroke="#9CA3AF" angle={-15} textAnchor="end" height={60} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#9CA3AF' }}
                formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
              />
              <Line type="monotone" dataKey="온도" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="최고" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="최저" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 날씨별 데이터 수 */}
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <h3 className="text-white text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            날씨별 데이터 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weatherChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} name="데이터 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 차트 영역 - 두 번째 행 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 상의 분포 */}
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <h3 className="text-white text-lg mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-purple-400" />
            상의 선택 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {topChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 하의 분포 */}
        <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
          <h3 className="text-white text-lg mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-pink-400" />
            하의 선택 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bottomChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bottomChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="검색 (사용자 ID, 이름, 의류)..."
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
            title="검색 초기화"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-[#1e2534] border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-white text-lg">상세 데이터 목록</h3>
          <span className="text-gray-400 text-sm">
            {filteredData.length} / {userdata.length}개
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 text-sm">번호</th>
                <th className="text-left p-4 text-gray-400 text-sm">사용자 ID</th>
                <th className="text-left p-4 text-gray-400 text-sm">이름</th>
                <th className="text-left p-4 text-gray-400 text-sm">상의</th>
                <th className="text-left p-4 text-gray-400 text-sm">하의</th>
                <th className="text-left p-4 text-gray-400 text-sm">날씨</th>
                <th className="text-left p-4 text-gray-400 text-sm">온도</th>
                <th className="text-left p-4 text-gray-400 text-sm">최고/최저</th>
                <th className="text-left p-4 text-gray-400 text-sm">풍속</th>
                <th className="text-left p-4 text-gray-400 text-sm">등록일시</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      데이터를 불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-gray-400">
                    {searchQuery ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.data_num}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4 text-gray-300">{item.data_num}</td>
                    <td className="p-4 text-cyan-400 text-sm">{item.ID}</td>
                    <td className="p-4 text-white">{item.user_name || '-'}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded text-sm bg-purple-500/20 text-purple-400">
                        {item.top}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded text-sm bg-pink-500/20 text-pink-400">
                        {item.bottom}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      <span className="flex items-center gap-2">
                        <span>{getWeatherEmoji(item.weather_code)}</span>
                        {getWeatherName(item.weather_code)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-orange-400">{item.temperature}°C</span>
                    </td>
                    <td className="p-4 text-gray-300">
                      <span className="text-red-400">{item.temperature_max}°</span> /{' '}
                      <span className="text-blue-400">{item.temperature_min}°</span>
                    </td>
                    <td className="p-4 text-green-400">{item.wind_speed} m/s</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(item.created_at).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}