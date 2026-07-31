import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmergencyBanner } from '../components/ui/EmergencyBanner';
import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';
import { Toast, ToastMessage } from '../components/ui/Toast';

export const StaffLayout: React.FC = () => {
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  // Helper for child staff routes to broadcast toast alerts
  const showBroadcastToast = (title: string, message: string) => {
    setActiveToast({
      id: `toast-${Date.now()}`,
      title,
      message,
      type: 'broadcast',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      <EmergencyBanner />
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ showBroadcastToast }} />
        </main>
      </div>

      <Toast toast={activeToast} onClose={() => setActiveToast(null)} />
    </div>
  );
};
