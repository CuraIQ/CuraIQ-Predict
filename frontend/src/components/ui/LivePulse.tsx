import React from 'react';

interface LivePulseProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'amber' | 'coral' | 'sky';
}

export const LivePulse: React.FC<LivePulseProps> = ({
  label = 'LIVE',
  size = 'md',
  color = 'emerald',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const bgColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    coral: 'bg-red-500',
    sky: 'bg-sky-500',
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 font-semibold text-[11px] tracking-wider uppercase">
      <span className="relative flex">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bgColors[color]}`}></span>
        <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${bgColors[color]}`}></span>
      </span>
      {label && <span>{label}</span>}
    </div>
  );
};
