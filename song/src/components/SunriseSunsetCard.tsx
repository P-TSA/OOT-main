import { Sunrise, Sunset, Clock } from 'lucide-react';
import { sunData } from '../data/weatherData';

export function SunriseSunsetCard() {
  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-white text-lg">일출/일몰</h3>
        <p className="text-gray-400 text-sm">서울 기준 태양 및 달 정보</p>
      </div>

      {/* 일출/일몰 시간 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg p-4 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sunrise className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">일출</span>
          </div>
          <p className="text-white text-2xl">{sunData.sunrise}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Sunset className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400">일몰</span>
          </div>
          <p className="text-white text-2xl">{sunData.sunset}</p>
        </div>
      </div>

      {/* 낮 시간 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-gray-400 text-sm">낮 시간</span>
        </div>
        <p className="text-white text-lg">{sunData.dayLength}</p>
      </div>

      {/* 달 위상 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">달 위상</p>
            <p className="text-white">{sunData.moonPhase}</p>
          </div>
          <div className="text-4xl">{sunData.moonPhaseIcon}</div>
        </div>
      </div>
    </div>
  );
}
