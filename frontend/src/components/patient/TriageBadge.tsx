import React from 'react';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TriageBadgeProps {
  workload: 'Normal' | 'High Volume' | 'Critical Capacity';
  patientCount?: number;
}

export const TriageBadge: React.FC<TriageBadgeProps> = ({
  workload,
  patientCount = 14,
}) => {
  const isNormal = workload === 'Normal';
  const isHigh = workload === 'High Volume';

  const config = isNormal
    ? {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: ShieldCheck,
        iconColor: 'text-emerald-600',
        badge: 'Normal Triage Flow',
      }
    : isHigh
    ? {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Activity,
        iconColor: 'text-amber-600',
        badge: 'Elevated Triage Load',
      }
    : {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: AlertTriangle,
        iconColor: 'text-rose-600',
        badge: 'Surge Protocol Active',
      };

  const IconComponent = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.bg} flex items-center justify-between shadow-2xs`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-white shadow-2xs">
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Triage Status</div>
          <div className="text-base font-bold font-outfit">{workload}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-500 font-medium">In Queue</div>
        <div className="text-lg font-bold font-outfit">{patientCount} Patients</div>
      </div>
    </div>
  );
};
