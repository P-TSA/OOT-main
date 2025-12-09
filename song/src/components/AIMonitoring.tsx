import { Activity, CheckCircle, AlertTriangle, Clock, Zap, Database, TrendingUp, Server } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AIMonitoring() {
  // 모의 데이터 - 실제로는 백엔드 API에서 가져와야 함
  const modelStatus = {
    status: 'online',
    lastCheck: '2025-12-08 14:30:25',
    uptime: '99.8%',
    totalRequests: 15847,
    successRate: 99.2,
    avgResponseTime: 245,
  };

  // API 응답 시간 차트 데이터
  const responseTimeData = [
    { time: '10:00', ms: 230 },
    { time: '11:00', ms: 245 },
    { time: '12:00', ms: 220 },
    { time: '13:00', ms: 260 },
    { time: '14:00', ms: 245 },
    { time: '15:00', ms: 238 },
    { time: '16:00', ms: 252 },
  ];

  // 날씨 예측 정확도 데이터
  const accuracyData = [
    { metric: '온도', accuracy: 94 },
    { metric: '풍속', accuracy: 89 },
    { metric: '날씨상태', accuracy: 92 },
    { metric: '강수확률', accuracy: 87 },
  ];

  // 최근 API 호출 로그
  const recentLogs = [
    { id: 1, time: '14:30:15', endpoint: 'IP 위치 확인', status: 'success', responseTime: '180ms' },
    { id: 2, time: '14:30:18', endpoint: 'Geocoding API', status: 'success', responseTime: '210ms' },
    { id: 3, time: '14:30:22', endpoint: 'Open-Meteo API', status: 'success', responseTime: '320ms' },
    { id: 4, time: '14:29:45', endpoint: 'IP 위치 확인', status: 'success', responseTime: '165ms' },
    { id: 5, time: '14:29:48', endpoint: 'Geocoding API', status: 'success', responseTime: '195ms' },
    { id: 6, time: '14:29:52', endpoint: 'Open-Meteo API', status: 'success', responseTime: '298ms' },
  ];

  // 모델 성능 메트릭
  const performanceMetrics = [
    { label: '총 요청 수', value: '15,847', icon: Database, color: 'text-blue-400' },
    { label: '성공률', value: '99.2%', icon: CheckCircle, color: 'text-green-400' },
    { label: '평균 응답시간', value: '245ms', icon: Zap, color: 'text-yellow-400' },
    { label: '가동 시간', value: '99.8%', icon: Activity, color: 'text-purple-400' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-200 px-3 py-2 rounded shadow-lg border border-gray-300">
          <p className="text-gray-800">{`${payload[0].value}ms`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-200 px-3 py-2 rounded shadow-lg border border-gray-300">
          <p className="text-gray-800">{`정확도: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-white text-2xl mb-2">AI 점검 및 확인</h2>
        <p className="text-gray-400">날씨 예측 AI 모델의 성능 및 상태를 실시간으로 모니터링합니다</p>
      </div>

      {/* 모델 상태 카드 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-white/90 text-sm">모델 상태</div>
            <div className="text-white text-2xl">정상 작동 중</div>
            <div className="text-white/80 text-sm mt-1">마지막 점검: {modelStatus.lastCheck}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/90 text-sm">가동률</div>
          <div className="text-white text-3xl">{modelStatus.uptime}</div>
        </div>
      </div>

      {/* 성능 메트릭 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-gray-400 text-sm mb-1">{metric.label}</div>
              <div className="text-white text-2xl">{metric.value}</div>
            </div>
          );
        })}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API 응답 시간 차트 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-white">API 응답 시간</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ms" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center text-sm text-gray-400">
            평균: {modelStatus.avgResponseTime}ms
          </div>
        </div>

        {/* 예측 정확도 차트 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-white">예측 정확도</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="metric" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="accuracy" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 text-center text-sm text-gray-400">
            전체 평균 정확도: 90.5%
          </div>
        </div>
      </div>

      {/* API 호출 로그 테이블 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white">최근 API 호출 로그</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">시간</th>
                <th className="text-left py-3 px-4 text-gray-400">엔드포인트</th>
                <th className="text-left py-3 px-4 text-gray-400">상태</th>
                <th className="text-left py-3 px-4 text-gray-400">응답 시간</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-gray-300">{log.time}</td>
                  <td className="py-3 px-4 text-gray-300">{log.endpoint}</td>
                  <td className="py-3 px-4">
                    {log.status === 'success' ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        성공
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        실패
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{log.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모델 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">사용 중인 API</div>
          <div className="text-white mb-1">• Open-Meteo API</div>
          <div className="text-white mb-1">• IPinfo.io API</div>
          <div className="text-white">• Geocoding API</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">데이터 소스</div>
          <div className="text-white mb-1">• 시간별 온도 데이터</div>
          <div className="text-white mb-1">• 풍속 데이터</div>
          <div className="text-white">• 날씨 코드 (45개 유형)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-5">
          <div className="text-gray-400 text-sm mb-2">업데이트 주기</div>
          <div className="text-white mb-1">• 실시간 위치 확인</div>
          <div className="text-white mb-1">• 시간별 업데이트</div>
          <div className="text-white">• 타임존: Asia/Seoul</div>
        </div>
      </div>
    </div>
  );
}
