import { useState, useCallback } from 'react';
import { PredictIQQueryProvider } from './providers/QueryProvider';
import { Dashboard } from './components/Dashboard';
import { AlertToast } from './components/AlertToast';
import { usePredictiveAlerts } from './hooks/usePredictiveAlerts';
import type { WsAlertPayload } from './api/types';

function AlertToasts() {
  const [toasts, setToasts] = useState<WsAlertPayload[]>([]);

  const handleAlert = useCallback((alert: WsAlertPayload) => {
    setToasts((prev) => [alert, ...prev].slice(0, 5));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  usePredictiveAlerts({ onAlert: handleAlert });

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {toasts.map((alert) => (
        <AlertToast key={alert.id} alert={alert} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

export function App() {
  return (
    <PredictIQQueryProvider>
      <Dashboard />
      <AlertToasts />
    </PredictIQQueryProvider>
  );
}
