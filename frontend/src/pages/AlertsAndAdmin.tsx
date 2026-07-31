import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, approveUser, deleteUser, type User } from '../api/authApi';
import { useAuth } from '../contexts/AuthContext';
import {
  AlertTriangle, Info, ShieldAlert, UserCheck, UserX, Trash2,
  Bell, Shield, ChevronDown, ChevronUp,
} from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info';
interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  time: string;
  source: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1', severity: 'critical',
    title: 'ICU Bed Overflow Risk',
    description: 'ICU projected to reach 100% capacity within 2 hours based on current admission rate. Immediate action required.',
    time: '2 min ago', source: 'AI Risk Engine',
  },
  {
    id: '2', severity: 'critical',
    title: 'Propofol Stockout Imminent',
    description: 'Current burn rate will deplete Propofol stock within 10 hours. Emergency restock required from central pharmacy.',
    time: '5 min ago', source: 'Inventory AI',
  },
  {
    id: '3', severity: 'warning',
    title: 'ER Surge Pattern Detected',
    description: 'Historical patterns suggest 35% increase in ER arrivals between 20:00–02:00 tonight.',
    time: '15 min ago', source: 'Predictive Engine',
  },
  {
    id: '4', severity: 'warning',
    title: 'Night Shift Understaffed',
    description: 'ICU night shift (22:00) is projected to be short by 2 nurses. Recommend calling on-call staff now.',
    time: '22 min ago', source: 'Staffing AI',
  },
  {
    id: '5', severity: 'info',
    title: 'OR Suite 3 Available',
    description: 'Operating Room 3 has completed sanitization cycle. Ready for scheduling.',
    time: '30 min ago', source: 'OR Management',
  },
  {
    id: '6', severity: 'info',
    title: 'Shift Handover Completed',
    description: 'Day shift handover to evening shift completed successfully. All patient notes transferred.',
    time: '1h ago', source: 'System',
  },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-950/50 text-violet-300 border-violet-800',
  doctor: 'bg-red-950/50 text-red-300 border-red-800',
  nurse: 'bg-sky-950/50 text-sky-300 border-sky-800',
  pharmacist: 'bg-emerald-950/50 text-emerald-300 border-emerald-800',
};

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical', icon: ShieldAlert,
    class: 'border-red-900/60 bg-red-950/10',
    badge: 'bg-red-950/60 text-red-300 border-red-800',
    iconClass: 'text-red-400', iconBg: 'bg-red-900/50',
  },
  warning: {
    label: 'Warning', icon: AlertTriangle,
    class: 'border-amber-900/60 bg-amber-950/10',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800',
    iconClass: 'text-amber-400', iconBg: 'bg-amber-900/50',
  },
  info: {
    label: 'Info', icon: Info,
    class: 'border-slate-800 bg-slate-900/30',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    iconClass: 'text-slate-400', iconBg: 'bg-slate-800',
  },
};

export const AlertsAndAdmin: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>(MOCK_ALERTS);

  const isAdmin = user?.role === 'admin';

  // Connect to WebSocket for live surge alerts
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
    const ws = new WebSocket(`${wsUrl}/ws/alerts`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'surge_alert' || data.type === 'ward_update') {
          const newAlert: Alert = {
            id: `live-${Date.now()}`,
            severity: data.type === 'surge_alert' ? 'critical' : 'warning',
            title: data.type === 'surge_alert' ? '🚨 SURGE: Emergency Protocol Activated' : 'Ward Capacity Updated',
            description: data.message,
            time: 'Just now',
            source: 'Live System',
          };
          setLiveAlerts((prev) => [newAlert, ...prev]);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const filtered = filter === 'all' ? liveAlerts : liveAlerts.filter((a) => a.severity === filter);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['staff-users'],
    queryFn: fetchAllUsers,
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-users'] }),
  });

  const pending = users.filter((u) => u.status === 'pending_approval');
  const active = users.filter((u) => u.status === 'active');

  return (
    <div className="space-y-8">
      {/* ── Alert Feed ─────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Bell className="w-4 h-4" />
              Predictive Alert Feed
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Alert Center</h1>
            <p className="text-sm text-slate-400 mt-1">Live + AI-generated risk notifications</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'critical', 'warning', 'info'] as const).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {f === 'all' ? `All (${liveAlerts.length})` : f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity];
            const Icon = cfg.icon;
            const isOpen = expanded === alert.id;
            return (
              <div key={alert.id} className={`border rounded-2xl overflow-hidden transition-all ${cfg.class}`}>
                <button
                  id={`alert-${alert.id}`}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : alert.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                    <Icon className={`w-5 h-5 ${cfg.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-white text-sm">{alert.title}</p>
                      <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {alert.source} • {alert.time}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 border-t border-white/5">
                    <p className="text-sm text-slate-300 mt-3 leading-relaxed">{alert.description}</p>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No {filter !== 'all' ? filter : ''} alerts at this time</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Admin Panel ─────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-950/60 border border-violet-800/50 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-bold text-white">Admin: Staff Directory</h2>
              <p className="text-xs text-slate-400">Manage access requests and active accounts</p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Pending */}
              {pending.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Pending Requests ({pending.length})
                  </h3>
                  <div className="space-y-2">
                    {pending.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-4 p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold text-white">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{u.name}</p>
                            <p className="text-xs text-slate-400">
                              {u.email} • {u.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.nurse}`}
                          >
                            {u.role}
                          </span>
                          <button
                            id={`approve-${u.id}`}
                            onClick={() => approveMutation.mutate(u.id)}
                            disabled={approveMutation.isPending}
                            className="p-2 bg-emerald-900/40 border border-emerald-800/50 hover:bg-emerald-800/60 text-emerald-300 rounded-lg transition-colors"
                            title="Approve Access"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            id={`reject-${u.id}`}
                            onClick={() => deleteMutation.mutate(u.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 bg-red-950/40 border border-red-900/50 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors"
                            title="Reject Request"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Staff */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Active Staff ({active.length})
                </h3>
                <div className="space-y-2">
                  {active.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-4 p-4 border border-slate-800 rounded-xl hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                            u.role === 'admin'
                              ? 'bg-violet-900'
                              : u.role === 'doctor'
                              ? 'bg-red-900'
                              : u.role === 'pharmacist'
                              ? 'bg-emerald-900'
                              : 'bg-sky-900'
                          }`}
                        >
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">
                            {u.email} • {u.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.nurse}`}
                        >
                          {u.role}
                        </span>
                        <button
                          id={`delete-${u.id}`}
                          onClick={() => {
                            if (confirm(`Delete account for ${u.name}?`)) deleteMutation.mutate(u.id);
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-red-950/40 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {active.length === 0 && (
                    <p className="text-sm text-slate-500 p-4">No active accounts.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
