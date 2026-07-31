import React, { useEffect, useState } from 'react';
import type { WsAlertPayload, RiskLevel } from '../api/types';

interface AlertToastProps {
  alert: WsAlertPayload;
  onDismiss: (id: string) => void;
  autoCloseMs?: number;
}

const RISK_COLORS: Record<RiskLevel, { bg: string; border: string; icon: string }> = {
  critical: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: '🔴' },
  high: { bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', icon: '🟠' },
  medium: { bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308', icon: '🟡' },
  low: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', icon: '🟢' },
};

/**
 * Animated toast notification for real-time predictive alerts.
 * Auto-dismisses after `autoCloseMs` (default 8s) with a smooth exit transition.
 */
export function AlertToast({ alert, onDismiss, autoCloseMs = 8_000 }: AlertToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const colors = RISK_COLORS[alert.risk_level] ?? RISK_COLORS.medium;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(alert.id), 300);
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [alert.id, autoCloseMs, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(alert.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 8px 32px ${colors.border}33`,
        animation: isExiting
          ? 'toast-exit 0.3s ease-in forwards'
          : 'toast-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '420px',
        width: '100%',
      }}
    >
      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{colors.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.border,
            marginBottom: '0.25rem',
          }}
        >
          {alert.risk_level} Risk — {alert.prediction_type.replace(/_/g, ' ')}
        </div>
        <div
          style={{
            fontSize: '0.875rem',
            color: '#e2e8f0',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {alert.forecasted_event}
        </div>
        {alert.recommended_action && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              marginTop: '0.375rem',
              fontStyle: 'italic',
            }}
          >
            Recommended: {alert.recommended_action}
          </div>
        )}
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss alert"
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '1.125rem',
          padding: '0.25rem',
          lineHeight: 1,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
      >
        ✕
      </button>

      <style>{`
        @keyframes toast-enter {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-exit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(100%) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
