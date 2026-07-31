import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, FlaskConical, Bell, LineChart,
  ShieldCheck, UserCheck, LogOut, Shield, Stethoscope, Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_ICON: Record<string, React.ElementType> = {
  admin: Shield,
  doctor: Stethoscope,
  nurse: Activity,
  pharmacist: FlaskConical,
};

const ROLE_COLOR: Record<string, string> = {
  admin: 'text-violet-400 bg-violet-950/60 border-violet-800/50',
  doctor: 'text-red-400 bg-red-950/60 border-red-800/50',
  nurse: 'text-sky-400 bg-sky-950/60 border-sky-800/50',
  pharmacist: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'nurse';

  const navItems = [
    {
      to: '/staff/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      description: 'Live KPIs & AI risk radar',
      roles: ['admin', 'doctor', 'nurse', 'pharmacist'],
    },
    {
      to: '/staff/wards',
      label: 'Bed Management',
      icon: Building2,
      description: 'Ward capacity & OR status',
      roles: ['admin', 'doctor', 'nurse'],
    },
    {
      to: '/staff/inventory',
      label: 'Pharmacy & Inventory',
      icon: FlaskConical,
      description: 'Stock levels & reorder triggers',
      roles: ['admin', 'pharmacist'],
    },
    {
      to: '/staff/alerts',
      label: 'Alerts & Admin',
      icon: Bell,
      description: 'AI alerts & staff management',
      roles: ['admin', 'doctor', 'nurse', 'pharmacist'],
    },
    {
      to: '/staff/analytics',
      label: 'AI Forecasting',
      icon: LineChart,
      description: 'Trends & predictive analytics',
      roles: ['admin', 'doctor'],
    },
  ].filter((item) => item.roles.includes(role));

  const RoleIcon = ROLE_ICON[role] || UserCheck;
  const roleColorClass = ROLE_COLOR[role] || ROLE_COLOR.nurse;

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinical Staff Portal</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">St. Jude Regional Medical Center</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-start gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold">{item.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                {item.description}
              </div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${roleColorClass}`}>
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 capitalize truncate">
                {user.role} • {user.department}
              </div>
            </div>
          </div>
          <button
            id="sidebar-logout"
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
};
