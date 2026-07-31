import React from 'react';

interface CapacityBarProps {
  percentage: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CapacityBar: React.FC<CapacityBarProps> = ({
  percentage,
  label,
  showValue = true,
  size = 'md',
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));

  // Determine color theme
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';

  if (clamped >= 85) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-700';
  } else if (clamped >= 65) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-3.5';

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && <span className={`font-bold ${textColor}`}>{clamped.toFixed(0)}% Occupied</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
