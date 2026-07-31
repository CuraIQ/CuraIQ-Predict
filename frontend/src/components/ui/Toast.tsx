import React, { useEffect } from 'react';
import { Radio, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'broadcast' | 'success' | 'warning' | 'info';
  timestamp?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    broadcast: <Radio className="w-5 h-5 text-sky-500 animate-pulse" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-slate-500" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-toast">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700/80 flex items-start gap-3.5 backdrop-blur-lg">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
          {icons[toast.type || 'broadcast']}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-sky-300">{toast.title}</h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {toast.timestamp || new Date().toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
