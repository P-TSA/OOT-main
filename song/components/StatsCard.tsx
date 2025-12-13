import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'text-blue-400' }: StatsCardProps) {
  return (
    <div className="bg-[#1e2534] border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-white text-2xl">{value.toLocaleString()}</p>
        </div>
        <div className={`${iconColor} p-3 bg-gray-800/50 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
