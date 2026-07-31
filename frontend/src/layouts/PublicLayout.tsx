import React from 'react';
import { Outlet } from 'react-router-dom';
import { EmergencyBanner } from '../components/ui/EmergencyBanner';
import { Header } from '../components/ui/Header';
import { Shield, HeartPulse } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <EmergencyBanner />
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Hospital Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-slate-200">CuraIQ Predict Hospital Intelligence System</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>HIPAA Compliant Data Protocol</span>
            <span>•</span>
            <span>Emergency Triage Standard (ESI 1-5)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> ISO 27001 Certified
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} CuraIQ Healthcare Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
