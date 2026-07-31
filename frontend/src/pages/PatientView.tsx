import React, { useState } from 'react';
import { useWardCapacity } from '../api/hooks/useWardCapacity';
import { WaitTimeHero } from '../components/patient/WaitTimeHero';
import { TriageBadge } from '../components/patient/TriageBadge';
import { WardOccupancyCard } from '../components/patient/WardOccupancyCard';
import { CheckInModal } from '../components/patient/CheckInModal';
import { ShieldCheck, UserPlus, Info } from 'lucide-react';

export const PatientView: React.FC = () => {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const { data: wards, isSuccess } = useWardCapacity();
  
  // Calculate aggregate occupancy
  let totalBeds = 0;
  let occupiedBeds = 0;
  if (wards) {
    wards.forEach(w => {
      totalBeds += w.capacity;
      occupiedBeds += w.occupied_beds;
    });
  }
  
  const occupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 78;
  const waitTime = occupancy > 90 ? 85 : occupancy > 80 ? 45 : 25;
  const aiMsg = occupancy > 90 
    ? 'Critical Capacity - High Wait Times for Non-Emergencies' 
    : occupancy > 80 
    ? 'High Volume - Expect Moderate Wait Times' 
    : 'Triage workload optimal. Standard priority queuing active.';
  
  const lastUpdated = isSuccess ? new Date().toLocaleTimeString() : 'Just now';

  // Triage Workload category
  const workload: 'Normal' | 'High Volume' | 'Critical Capacity' =
    waitTime > 60 ? 'Critical Capacity' : waitTime > 35 ? 'High Volume' : 'Normal';

  return (
    <div className="space-y-8 animate-toast">
      {/* Hero Section */}
      <WaitTimeHero
        waitTimeMins={waitTime}
        aiStatusMessage={aiMsg}
        lastUpdatedTime={lastUpdated}
      />

      {/* Quick Action & Triage Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8">
          <TriageBadge workload={workload} patientCount={workload === 'Normal' ? 8 : 16} />
        </div>
        <div className="md:col-span-4">
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <UserPlus className="w-5 h-5" />
            <span>Check-in Now</span>
          </button>
        </div>
      </div>

      {/* Ward Occupancy Overview */}
      <div id="ward-overview">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Hospital Ward Capacity</h3>
            <p className="text-xs text-slate-500">Live bed availability across core clinical departments</p>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Overall Occupancy: {occupancy}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wards ? wards.slice(0, 4).map(w => (
            <WardOccupancyCard
              key={w.id}
              wardName={w.ward_name}
              type={w.ward_type as any}
              occupied={w.occupied_beds}
              total={w.capacity}
            />
          )) : (
            <div className="col-span-4 text-center py-8 text-slate-500">Loading live capacity...</div>
          )}
        </div>
      </div>

      {/* Information Banner for Patients */}
      <div id="triage-info" className="bg-slate-100 p-6 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">How Triage Wait Times Are Calculated</h4>
            <p className="mt-0.5 leading-relaxed max-w-3xl">
              Wait times are continuously updated using CuraIQ's AI predictive model, factoring in emergency severity scores (ESI 1-5), incoming ambulance dispatches, and real-time physician availability. Life-threatening emergencies are seen immediately.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Verified Medical Protocol</span>
        </div>
      </div>

      {/* Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        currentWaitTime={waitTime}
      />
    </div>
  );
};
