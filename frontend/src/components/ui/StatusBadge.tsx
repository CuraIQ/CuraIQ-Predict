import React from 'react';

export type StatusType = 'normal' | 'busy' | 'critical' | 'green' | 'amber' | 'red';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const isGreen = status === 'normal' || status === 'green';
  const isAmber = status === 'busy' || status === 'amber';
  
  const styles = isGreen
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isAmber
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';

  const defaultLabel = isGreen ? 'Normal Volume' : isAmber ? 'High Volume' : 'Critical Capacity';
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-colors ${styles} ${sizeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-emerald-500' : isAmber ? 'bg-amber-500' : 'bg-rose-500'}`} />
      {label || defaultLabel}
    </span>
  );
};
