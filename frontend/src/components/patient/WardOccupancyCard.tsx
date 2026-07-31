import React from 'react';
import { Building, Stethoscope, BedDouble, AlertCircle } from 'lucide-react';
import { CapacityBar } from '../ui/CapacityBar';

interface WardOccupancyCardProps {
  wardName: string;
  occupied: number;
  total: number;
  type: 'er' | 'icu' | 'general' | 'surgery';
}

export const WardOccupancyCard: React.FC<WardOccupancyCardProps> = ({
  wardName,
  occupied,
  total,
  type,
}) => {
  const percentage = Math.round((occupied / total) * 100);

  const icons = {
    er: Stethoscope,
    icu: AlertCircle,
    general: BedDouble,
    surgery: Building,
  };

  const IconComponent = icons[type] || BedDouble;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{wardName}</h4>
            <span className="text-[11px] text-slate-400 font-medium">Live Bed Occupancy</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-900 font-outfit">{occupied}</span>
          <span className="text-xs text-slate-400">/{total}</span>
        </div>
      </div>

      <CapacityBar percentage={percentage} showValue={true} size="md" />
    </div>
  );
};
