import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sliders, Building2, LineChart, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      to: '/staff/dashboard',
      label: 'Live Control Panel',
      icon: Sliders,
      description: 'Bed occupancy & queue adjustments',
    },
    {
      to: '/staff/wards',
      label: 'Ward Intelligence',
      icon: Building2,
      description: 'Department capacity & 6h forecasts',
    },
    {
      to: '/staff/analytics',
      label: 'AI Forecasting & Audit',
      icon: LineChart,
      description: 'Wait time trends & system logs',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinical Staff Portal</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Authorized Medical Duty Session</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-start gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold">{item.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-900/80 border border-sky-600/40 flex items-center justify-center text-sky-300">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px] text-slate-400 capitalize truncate">{user.title}</div>
          </div>
        </div>
      )}
    </aside>
  );
};
