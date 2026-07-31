import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cross, LogIn, LogOut, UserCheck, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LivePulse } from './LivePulse';

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isStaffArea = location.pathname.startsWith('/staff');

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hospital Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
                <Cross className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight font-outfit">CuraIQ</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200">PREDICT</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">St. Jude Regional Medical Center</span>
              </div>
            </Link>
          </div>

          {/* Center Info / Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
              <LivePulse label="ER Operational" color="emerald" size="sm" />
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Live Sync: Active
              </span>
            </div>

            {/* Public Navigation Links */}
            {!isStaffArea && (
              <nav className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <Link to="/" className={`hover:text-sky-600 transition-colors ${location.pathname === '/' ? 'text-sky-600 font-bold' : ''}`}>
                  Public Wait Times
                </Link>
                <a href="#triage-info" className="hover:text-sky-600 transition-colors">
                  Triage Process
                </a>
                <a href="#ward-overview" className="hover:text-sky-600 transition-colors">
                  Ward Status
                </a>
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                    {user.role} • {user.department}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                  title="Sign out of staff session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm hover:shadow transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Staff Portal Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
