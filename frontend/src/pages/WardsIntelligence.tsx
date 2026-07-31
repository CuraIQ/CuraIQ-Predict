import React, { useState } from 'react';
import { Building2, AlertTriangle, TrendingUp, Users, Filter } from 'lucide-react';
import { CapacityBar } from '../components/ui/CapacityBar';
import { StatusBadge } from '../components/ui/StatusBadge';

interface Department {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  forecast2h: number;
  forecast6h: number;
  riskFlag: 'green' | 'amber' | 'red';
  onDutyStaff: number;
  predictedSurge: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'dept_er',
    name: 'Emergency Department (ER)',
    type: 'Emergency Triage',
    capacity: 50,
    occupied: 41,
    forecast2h: 46,
    forecast6h: 49,
    riskFlag: 'amber',
    onDutyStaff: 18,
    predictedSurge: '+12 patient arrivals projected in 3h (EMS highway collision alert)',
  },
  {
    id: 'dept_icu',
    name: 'Intensive Care Unit (ICU)',
    type: 'Critical Care',
    capacity: 50,
    occupied: 44,
    forecast2h: 47,
    forecast6h: 50,
    riskFlag: 'red',
    onDutyStaff: 22,
    predictedSurge: 'ICU Bed Overflow imminent within 4.5 hours (98% threshold)',
  },
  {
    id: 'dept_gen',
    name: 'General Medicine Ward',
    type: 'Inpatient Care',
    capacity: 250,
    occupied: 218,
    forecast2h: 226,
    forecast6h: 240,
    riskFlag: 'red',
    onDutyStaff: 35,
    predictedSurge: 'High discharge rate pending; reserve 15 beds for step-down',
  },
  {
    id: 'dept_surg',
    name: 'Surgical Recovery & OR',
    type: 'Perioperative',
    capacity: 100,
    occupied: 88,
    forecast2h: 90,
    forecast6h: 82,
    riskFlag: 'amber',
    onDutyStaff: 16,
    predictedSurge: 'Post-op recovery beds expected to normalize by 18:00',
  },
  {
    id: 'dept_peds',
    name: 'Pediatrics Ward',
    type: 'Pediatric Care',
    capacity: 50,
    occupied: 36,
    forecast2h: 37,
    forecast6h: 38,
    riskFlag: 'green',
    onDutyStaff: 12,
    predictedSurge: 'Stable capacity; no surge flagged for next 12 hours',
  },
  {
    id: 'dept_rad',
    name: 'Radiology & Trauma Imaging',
    type: 'Diagnostic Imaging',
    capacity: 30,
    occupied: 24,
    forecast2h: 28,
    forecast6h: 22,
    riskFlag: 'amber',
    onDutyStaff: 9,
    predictedSurge: 'CT scanner queue +4 patients; back-up scanner online',
  },
];

export const WardsIntelligence: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'red' | 'amber' | 'green'>('all');

  const filteredDepts = DEPARTMENTS.filter(
    (d) => selectedFilter === 'all' || d.riskFlag === selectedFilter
  );

  return (
    <div className="space-y-6 animate-toast text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Hospital Department Matrix</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit mt-1">Ward & Department Intelligence</h2>
          <p className="text-xs text-slate-400">
            Real-time capacity tracking and 2–6 hour AI predictive triage overload forecasting.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedFilter === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({DEPARTMENTS.length})
          </button>
          <button
            onClick={() => setSelectedFilter('red')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedFilter === 'red' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:bg-slate-900'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setSelectedFilter('amber')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedFilter === 'amber' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:bg-slate-900'
            }`}
          >
            Busy
          </button>
          <button
            onClick={() => setSelectedFilter('green')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedFilter === 'green' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:bg-slate-900'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => {
          const occupancyRate = Math.round((dept.occupied / dept.capacity) * 100);
          const rate2h = Math.round((dept.forecast2h / dept.capacity) * 100);
          const rate6h = Math.round((dept.forecast6h / dept.capacity) * 100);

          return (
            <div
              key={dept.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors font-outfit">
                    {dept.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{dept.type}</span>
                </div>
                <StatusBadge status={dept.riskFlag} size="sm" />
              </div>

              {/* Live Occupancy Bar */}
              <CapacityBar percentage={occupancyRate} label="Current Occupancy" showValue={true} size="md" />

              {/* Bed Count Summary */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Beds Occupied</span>
                  <span className="text-sm font-bold text-white">{dept.occupied} / {dept.capacity}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Staff On Duty</span>
                  <span className="text-sm font-bold text-sky-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {dept.onDutyStaff} Personnel
                  </span>
                </div>
              </div>

              {/* AI Forecast Section */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    2-Hour Forecast:
                  </span>
                  <span className={`font-bold font-mono ${rate2h >= 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {rate2h}% ({dept.forecast2h} beds)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    6-Hour Forecast:
                  </span>
                  <span className={`font-bold font-mono ${rate6h >= 90 ? 'text-rose-400' : 'text-slate-200'}`}>
                    {rate6h}% ({dept.forecast6h} beds)
                  </span>
                </div>

                {/* AI Predictive Insight Chip */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-amber-200 leading-snug flex items-start gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{dept.predictedSurge}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
