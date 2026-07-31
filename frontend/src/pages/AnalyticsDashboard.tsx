import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon, History, ShieldCheck, Calendar } from 'lucide-react';
import { useHospitalStore } from '../store/useHospitalStore';

// Historical & Forecasted Wait Time Data
const FORECAST_DATA = [
  { time: '08:00', actual: 25, predicted: 24, volume: 12 },
  { time: '10:00', actual: 32, predicted: 30, volume: 18 },
  { time: '12:00', actual: 45, predicted: 42, volume: 28 },
  { time: '14:00', actual: 50, predicted: 48, volume: 34 },
  { time: '16:00', actual: 42, predicted: 44, volume: 22 },
  { time: '18:00', actual: 38, predicted: 40, volume: 19 },
  { time: '20:00', actual: null, predicted: 46, volume: 26 }, // Forecasted
  { time: '22:00', actual: null, predicted: 52, volume: 31 }, // Forecasted
  { time: '00:00', actual: null, predicted: 35, volume: 15 }, // Forecasted
  { time: '02:00', actual: null, predicted: 22, volume: 8 },  // Forecasted
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log_1',
    staff: 'Dr. Sarah Jenkins, MD',
    action: 'Updated ER Queue count to 14 patients',
    time: '2 mins ago',
    category: 'Telemetry',
  },
  {
    id: 'log_2',
    staff: 'Marcus Vance (Admin)',
    action: 'Triggered Day Shift Handover Protocol',
    time: '18 mins ago',
    category: 'Shift Protocol',
  },
  {
    id: 'log_3',
    staff: 'Nurse E. Rivera, RN',
    action: 'Marked 5 beds available in General Medicine Ward B',
    time: '45 mins ago',
    category: 'Bed Allocation',
  },
  {
    id: 'log_4',
    staff: 'Dr. Alex Chen, MD',
    action: 'Accepted AI Recommendation: Trigger ICU Reserve Bed Allocation',
    time: '1 hour ago',
    category: 'AI Recommendation',
  },
  {
    id: 'log_5',
    staff: 'System Auto-Telemetry',
    action: 'Ingested 150 vital sensor records from ER Triage Desk 1-4',
    time: '2 hours ago',
    category: 'Telemetry Ingest',
  },
];

export const AnalyticsDashboard: React.FC = () => {
  const storeLogs = useHospitalStore((state) => state.actionLogs);

  // Combine store logs with initial mock logs
  const combinedLogs = [
    ...storeLogs.map((log, idx) => ({
      id: `store_${idx}`,
      staff: 'Duty Physician (Session)',
      action: `Executed action: ${log.action.toUpperCase()} on prediction ${log.predictionId}`,
      time: log.timestamp,
      category: 'Staff Action',
    })),
    ...INITIAL_AUDIT_LOGS,
  ];

  return (
    <div className="space-y-6 animate-toast text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <LineChartIcon className="w-4 h-4" />
            <span>Predictive Modeling & Audit Trail</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit mt-1">AI Predictions & Telemetry Log</h2>
          <p className="text-xs text-slate-400">
            Comparative analysis of historical vs forecasted wait times alongside staff operational event logs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>24-Hour Cycle Analysis</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-outfit">Triage Wait Time Forecast (Minutes)</h3>
            <p className="text-xs text-slate-400">Solid line: Historical actual wait times | Dashed line: AI 6-hour projection</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-sky-400">
              <span className="w-3 h-0.5 bg-sky-400 inline-block" />
              <span>Actual Wait</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" />
              <span>AI Predicted</span>
            </div>
          </div>
        </div>

        {/* Recharts Responsive Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FORECAST_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} unit="m" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF', fontSize: '12px' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
              <Area type="monotone" dataKey="actual" stroke="#0284C7" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Wait (mins)" />
              <Area type="monotone" dataKey="predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" name="AI Predicted (mins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Medical Personnel System Audit Log</h3>
              <p className="text-xs text-slate-400">Immutable event log of staff overrides, slider adjustments, and shift updates</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
            {combinedLogs.length} Events Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Medical Personnel / User</th>
                <th className="p-4">Action & Operational Event</th>
                <th className="p-4">Event Category</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {combinedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>{log.staff}</span>
                  </td>
                  <td className="p-4 text-slate-200">{log.action}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700 text-[10px] font-mono">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-400 font-mono">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
