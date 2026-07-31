import React from 'react';
import { PhoneCall, ShieldAlert, Activity } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs py-1.5 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-200 animate-pulse" />
          <span>Emergency Hotline & Crisis Triage Protocol Active</span>
          <span className="hidden sm:inline-block text-red-200">|</span>
          <span className="hidden md:inline-block text-red-100">CuraIQ Predict Hospital Network</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-red-800/60 px-2.5 py-0.5 rounded-full border border-red-400/30">
            <PhoneCall className="w-3 h-3 text-red-200" />
            <span>Emergency Desk: <strong className="text-amber-200">911</strong></span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-red-100">
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            <span>Triage Dispatch: (555) 019-9831</span>
          </div>
        </div>
      </div>
    </div>
  );
};
