import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useHospitalStore } from '../store/useHospitalStore';
import { Sliders, Activity, CheckCircle2, RefreshCw, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { UserManagementPanel } from '../components/admin/UserManagementPanel';

export const StaffDashboard: React.FC = () => {
  const { showBroadcastToast } = useOutletContext<{ showBroadcastToast: (title: string, message: string) => void }>() || {};
  const { user } = useAuth();

  const [bedCount, setBedCount] = useState(75);
  const [erQueueCount, setErQueueCount] = useState(14);
  const [doctorAvailability, setDoctorAvailability] = useState(12);
  const [isShiftDay, setIsShiftDay] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const addActionLog = useHospitalStore((state) => state.addActionLog);

  // Debounced backend telemetry sync
  useEffect(() => {
    const updateBackend = async () => {
      setIsUpdating(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/staff/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true',
          },
          body: JSON.stringify({
            bed_count: bedCount,
            er_queue_count: erQueueCount,
            doctor_availability: doctorAvailability,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPrediction(data);
        }
      } catch (err) {
        console.error('Failed to update telemetry:', err);
      } finally {
        setIsUpdating(false);
      }
    };

    const timeoutId = setTimeout(() => {
      updateBackend();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [bedCount, erQueueCount, doctorAvailability]);

  // Quick actions trigger
  const handleQuickAction = (actionName: string, detail: string) => {
    if (actionName === 'Mark Bed Available') {
      setBedCount((prev) => Math.max(0, prev - 5));
    } else if (actionName === 'Call Next Patient') {
      setErQueueCount((prev) => Math.max(0, prev - 1));
    } else if (actionName === 'Trigger Surge Alert') {
      setErQueueCount((prev) => prev + 10);
    }

    // Add audit log
    addActionLog({
      predictionId: `act-${Date.now()}`,
      action: 'override',
      status: 'accepted',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Broadcast toast
    if (showBroadcastToast) {
      showBroadcastToast(
        `Staff Quick Action Executed: ${actionName}`,
        `${detail} | Updated by Duty Supervisor.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-toast text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Clinical Control Center</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit mt-1">Live Metric Control Panel</h2>
          <p className="text-xs text-slate-400">
            Adjust hospital telemetry sliders to broadcast live triage wait times to the public patient view.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Shift Handover Toggle */}
          <button
            onClick={() => {
              setIsShiftDay(!isShiftDay);
              if (showBroadcastToast) {
                showBroadcastToast('Shift Handover Switched', `Active shift toggled to ${!isShiftDay ? 'Day Shift (08:00–20:00)' : 'Night Shift (20:00–08:00)'}`);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isShiftDay ? '' : 'rotate-180'}`} />
            <span>{isShiftDay ? 'Day Shift (08:00 - 20:00)' : 'Night Shift (20:00 - 08:00)'}</span>
          </button>

          {isUpdating && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 text-xs font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Broadcasting AI...
            </span>
          )}
        </div>
      </div>

      {user?.role === 'admin' && <UserManagementPanel />}

      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleQuickAction('Mark Bed Available', 'Released 5 beds in Ward B')}
          className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/80 text-emerald-200 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Action</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold font-outfit text-white">Mark Bed Available</div>
          <div className="text-[11px] text-emerald-300/80 mt-1">Discharge patient & free -5% occupancy</div>
        </button>

        <button
          onClick={() => handleQuickAction('Call Next Patient', 'Called Ticket #E-409 to Desk 1')}
          className="p-4 rounded-2xl bg-sky-950/60 border border-sky-800/80 hover:bg-sky-900/80 text-sky-200 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Action</span>
            <Zap className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold font-outfit text-white">Call Next Patient</div>
          <div className="text-[11px] text-sky-300/80 mt-1">Advance triage queue (-1 waiting)</div>
        </button>

        <button
          onClick={() => handleQuickAction('Trigger Surge Alert', 'Activated overflow triage tent')}
          className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/80 text-rose-200 text-left transition-all group shadow-md"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Surge Protocol</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <div className="text-sm font-bold font-outfit text-white">Trigger Surge Alert</div>
          <div className="text-[11px] text-rose-300/80 mt-1">Simulate mass casualty / arrival (+10 ER)</div>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bed Occupancy Slider */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bed Occupancy Rate</span>
            <span className="text-2xl font-extrabold text-sky-400 font-outfit">{bedCount}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bedCount}
            onChange={(e) => setBedCount(parseInt(e.target.value))}
            className="w-full accent-sky-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0% (Empty)</span>
            <span>50% (Optimal)</span>
            <span className="text-rose-400 font-bold">100% (Full)</span>
          </div>
        </div>

        {/* ER Queue Slider */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ER Queue Patients</span>
            <span className="text-2xl font-extrabold text-amber-400 font-outfit">{erQueueCount} waiting</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={erQueueCount}
            onChange={(e) => setErQueueCount(parseInt(e.target.value))}
            className="w-full accent-amber-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0 Patients</span>
            <span>25 Patients</span>
            <span className="text-rose-400 font-bold">50 Patients</span>
          </div>
        </div>

        {/* Available Doctors Slider */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active On-Duty Doctors</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-outfit">{doctorAvailability} Doctors</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={doctorAvailability}
            onChange={(e) => setDoctorAvailability(parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>1 Doctor</span>
            <span>15 Doctors</span>
            <span>30 Doctors</span>
          </div>
        </div>
      </div>

      {/* Live AI Broadcast Preview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Live AI Broadcast Engine Output
          </span>
          <span className="text-[11px] font-mono text-slate-400">Sync Target: Public Guest View</span>
        </div>

        {prediction ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Calculated Wait Time</span>
              <div className="text-4xl font-extrabold text-sky-400 font-outfit my-1">
                {prediction.wait_time_mins} <span className="text-base text-slate-300">Minutes</span>
              </div>
              <span className="text-xs text-slate-400">Estimated range: {Math.max(5, Math.round(prediction.wait_time_mins * 0.85))}–{Math.round(prediction.wait_time_mins * 1.2)} mins</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase">Automated Patient Alert Message</span>
              <div className="text-sm font-semibold text-amber-300 mt-1">
                "{prediction.ai_status_message}"
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-xs py-4">Calculating AI forecast from active sliders...</div>
        )}
      </div>
    </div>
  );
};
