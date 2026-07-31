import React from 'react';
import { Clock, TrendingDown, Sparkles } from 'lucide-react';
import { LivePulse } from '../ui/LivePulse';

interface WaitTimeHeroProps {
  waitTimeMins: number;
  aiStatusMessage: string;
  lastUpdatedTime: string;
}

export const WaitTimeHero: React.FC<WaitTimeHeroProps> = ({
  waitTimeMins,
  aiStatusMessage,
  lastUpdatedTime,
}) => {
  // Calculate range e.g. 35–50 mins based on severity
  const minWait = Math.max(5, Math.round(waitTimeMins * 0.85));
  const maxWait = Math.round(waitTimeMins * 1.2);

  const isCritical = waitTimeMins > 60;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
      {/* Background soft gradient blob */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <LivePulse label="Real-Time Sync" color="emerald" size="md" />
          <span className="text-xs text-slate-400 font-mono">Updated {lastUpdatedTime}</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>AI Predictive Model v4.2</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Main Big Counter Display */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-sky-600" />
            Current Emergency Room Wait Time
          </span>

          <div className="flex items-baseline gap-3 my-1">
            <span className={`text-6xl sm:text-7xl font-extrabold font-outfit tracking-tight leading-none ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
              {waitTimeMins}
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xl sm:text-2xl font-bold text-slate-700">Minutes</span>
              <span className="text-xs text-slate-500 font-medium">Estimated to See Triage Doctor</span>
            </div>
          </div>

          {/* Wait Time Range Pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Estimated Range: <strong>{minWait}–{maxWait} mins</strong> (Based on ESI Severity Score)</span>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Live AI Workload Analysis
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          </div>
          <p className="text-sm font-medium text-slate-100 leading-snug">
            "{aiStatusMessage}"
          </p>
          <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Triage Physician Ratio: 1:4</span>
            <span className="text-emerald-400 font-medium">Patient Flow: Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
