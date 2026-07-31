import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useHospitalStore } from '../store/useHospitalStore';
import { triggerSurge, updateWardBeds } from '../api/endpoints';
import { useWardCapacity } from '../api/hooks/useWardCapacity';
import { useHospitalOverview } from '../api/hooks/useHospitalOverview';
import { useActivePredictions } from '../api/hooks/useActivePredictions';
import { useExecuteRecommendation } from '../api/hooks/useExecuteRecommendation';
import {
  LayoutDashboard, CheckCircle2,
  Bed, Clock, FlaskConical, Users, TrendingUp, AlertCircle,
  Plus, Minus, RefreshCw, Siren,
} from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  critical: 'text-red-400 border-red-800 bg-red-950/30',
  high: 'text-amber-400 border-amber-800 bg-amber-950/30',
  medium: 'text-yellow-400 border-yellow-800 bg-yellow-950/20',
  low: 'text-emerald-400 border-emerald-800 bg-emerald-950/20',
};

const WARD_TYPE_COLOR: Record<string, string> = {
  icu: 'from-red-900/40 to-red-950/40 border-red-800/50',
  er: 'from-amber-900/40 to-amber-950/40 border-amber-800/50',
  general: 'from-blue-900/30 to-blue-950/40 border-blue-800/40',
  pediatric: 'from-purple-900/30 to-purple-950/40 border-purple-800/40',
  surgical: 'from-slate-800/60 to-slate-900/60 border-slate-700',
};

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const addActionLog = useHospitalStore((s) => s.addActionLog);
  const queryClient = useQueryClient();

  const [isSurging, setIsSurging] = useState(false);
  const [surgeActive, setSurgeActive] = useState(false);
  const [updatingWard, setUpdatingWard] = useState<string | null>(null);

  const { data: overview } = useHospitalOverview();
  const { data: wards } = useWardCapacity();
  const { data: predictionsPage } = useActivePredictions();
  const executeRec = useExecuteRecommendation();

  const predictions = predictionsPage?.data || [];
  const isAdmin = user?.role === 'admin';
  const canEditWards = ['nurse', 'doctor', 'admin'].includes(user?.role || '');

  // KPI derivations
  const occupancyRate = overview?.beds?.occupancy_rate ?? 0;
  const erWaitMins = occupancyRate > 90 ? 85 : occupancyRate > 80 ? 45 : 25;
  const lowStockCount = overview?.inventory?.items_below_threshold ?? 0;
  const onDutyStaff = overview?.staff?.on_duty ?? 0;
  const totalStaff = overview?.staff?.total_staff ?? 0;

  const handleSurge = async () => {
    if (!confirm('⚠️ Activate Hospital Emergency Surge Protocol?\n\nThis will update all ward statuses to critical and alert all connected clients in real-time.')) return;
    setIsSurging(true);
    try {
      await triggerSurge();
      setSurgeActive(true);
      addActionLog({ predictionId: `surge-${Date.now()}`, action: 'override', status: 'accepted', timestamp: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ['ward-capacity'] });
    } catch (err) {
      console.error('Surge trigger failed:', err);
    } finally {
      setIsSurging(false);
    }
  };

  const handleBedUpdate = async (wardId: string, action: 'add' | 'remove') => {
    setUpdatingWard(wardId);
    try {
      await updateWardBeds(wardId, action, 1);
      queryClient.invalidateQueries({ queryKey: ['ward-capacity'] });
      queryClient.invalidateQueries({ queryKey: ['hospital-overview'] });
    } catch (err) {
      console.error('Bed update failed:', err);
    } finally {
      setUpdatingWard(null);
    }
  };

  const handleAcceptPrediction = (predId: string) => {
    executeRec.mutate({ predictionId: predId, payload: { action: 'accept' } });
  };

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            Command Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">Operations Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Live hospital metrics, AI risk radar & action recommendations
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['hospital-overview'] });
              queryClient.invalidateQueries({ queryKey: ['ward-capacity'] });
              queryClient.invalidateQueries({ queryKey: ['predictions'] });
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>

          {isAdmin && (
            <button
              id="surge-button"
              onClick={handleSurge}
              disabled={isSurging}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg ${
                surgeActive
                  ? 'bg-red-950/60 border-red-700 text-red-300 animate-pulse'
                  : 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-red-600/30'
              } disabled:opacity-60`}
            >
              <Siren className="w-4 h-4" />
              {isSurging ? 'Activating...' : surgeActive ? 'SURGE ACTIVE' : 'Trigger Surge'}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Bed Occupancy',
            value: `${occupancyRate.toFixed(1)}%`,
            sub: occupancyRate >= 90 ? '🔴 CRITICAL' : occupancyRate >= 75 ? '🟡 HIGH' : '🟢 Normal',
            icon: Bed,
            color: occupancyRate >= 90 ? 'text-red-400' : occupancyRate >= 75 ? 'text-amber-400' : 'text-emerald-400',
            bg: occupancyRate >= 90 ? 'border-red-900/50 bg-red-950/20' : 'border-slate-800 bg-slate-900',
          },
          {
            label: 'ER Wait Time',
            value: `${erWaitMins} min`,
            sub: erWaitMins > 60 ? 'High Volume' : 'Normal',
            icon: Clock,
            color: erWaitMins > 60 ? 'text-red-400' : 'text-amber-400',
            bg: 'border-slate-800 bg-slate-900',
          },
          {
            label: 'Inventory Risk',
            value: `${lowStockCount} low stock`,
            sub: lowStockCount > 0 ? '⚠️ Attention needed' : '✅ All stocked',
            icon: FlaskConical,
            color: lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400',
            bg: lowStockCount > 0 ? 'border-amber-900/50 bg-amber-950/20' : 'border-slate-800 bg-slate-900',
          },
          {
            label: 'On-Call Staff',
            value: `${onDutyStaff}/${totalStaff}`,
            sub: 'Currently on duty',
            icon: Users,
            color: 'text-blue-400',
            bg: 'border-slate-800 bg-slate-900',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`border rounded-2xl p-5 ${card.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Ward Grid with Live Controls ────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Live Ward Capacity</h2>
          {canEditWards && (
            <span className="text-xs text-blue-400 bg-blue-950/40 border border-blue-900/50 px-2 py-0.5 rounded-full">
              Live Edit Enabled
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(wards || []).map((ward) => {
            const pct = ward.occupancy_rate;
            const barColor = pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
            const typeColor = WARD_TYPE_COLOR[ward.ward_type] || WARD_TYPE_COLOR.general;
            const isUpdating = updatingWard === ward.id;
            return (
              <div
                key={ward.id}
                className={`bg-gradient-to-br ${typeColor} border rounded-2xl p-5 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">{ward.ward_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{ward.ward_type}</p>
                  </div>
                  <span
                    className={`text-lg font-extrabold ${
                      pct >= 90 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-700/60 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>{ward.occupied_beds} / {ward.capacity} beds</span>
                  <span className="text-slate-500">{ward.available_beds} free</span>
                </div>

                {/* Live controls for nurses/doctors/admins */}
                {canEditWards && (
                  <div className="flex items-center gap-2">
                    <button
                      id={`ward-remove-${ward.id}`}
                      onClick={() => handleBedUpdate(ward.id, 'remove')}
                      disabled={isUpdating || ward.occupied_beds === 0}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-700/50 hover:bg-emerald-900/50 border border-slate-600 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" /> Discharge
                    </button>
                    <button
                      id={`ward-add-${ward.id}`}
                      onClick={() => handleBedUpdate(ward.id, 'add')}
                      disabled={isUpdating || ward.occupied_beds >= ward.capacity}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-700/50 hover:bg-red-900/50 border border-slate-600 hover:border-red-700 text-slate-300 hover:text-red-300 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" /> Admit
                    </button>
                  </div>
                )}

                {isUpdating && (
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center rounded-2xl">
                    <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI Risk Radar / Predictions ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Risk Radar & Recommendations</h2>
          {predictions.length > 0 && (
            <span className="text-xs text-red-300 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded-full animate-pulse">
              {predictions.length} active
            </span>
          )}
        </div>

        {predictions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">All clear — no active AI risk predictions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred) => {
              const colors = RISK_COLORS[pred.risk_level] || RISK_COLORS.low;
              return (
                <div
                  key={pred.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-2xl ${colors}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                          {pred.risk_level} risk
                        </span>
                        <span className="text-xs opacity-50">•</span>
                        <span className="text-xs opacity-50 capitalize">{pred.prediction_type.replace('_', ' ')}</span>
                      </div>
                      <p className="font-semibold text-white text-sm">{pred.forecasted_event}</p>
                      <p className="text-xs opacity-70 mt-0.5">{pred.recommended_action}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      id={`accept-pred-${pred.id}`}
                      onClick={() => handleAcceptPrediction(pred.id)}
                      disabled={executeRec.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept AI Rec
                    </button>
                    <button
                      onClick={() => executeRec.mutate({ predictionId: pred.id, payload: { action: 'dismiss' } })}
                      disabled={executeRec.isPending}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-all disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
