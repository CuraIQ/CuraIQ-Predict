import { useEffect, useRef, useCallback } from 'react';
import { useHospitalStore } from '../store/useHospitalStore';
import type { WsAlertPayload, RiskLevel } from '../api/types';

interface UsePredictiveAlertsOptions {
  /** WebSocket URL. Defaults to ws://localhost:8000/ws/alerts */
  url?: string;
  /** Minimum risk level to surface as a toast. Default: 'high' */
  minRiskLevel?: RiskLevel;
  /** Called when a high-severity alert arrives (for toast rendering). */
  onAlert?: (alert: WsAlertPayload) => void;
  /** Auto-reconnect delay in ms. Default: 3000 */
  reconnectDelay?: number;
  /** Enable/disable the connection. Default: true */
  enabled?: boolean;
}

const RISK_SEVERITY: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/**
 * WebSocket client hook that listens for predictive risk alerts.
 *
 * - Parses incoming JSON as `WsAlertPayload`
 * - Pushes alerts into the Zustand store for global badge counts
 * - Fires `onAlert` callback for alerts ≥ `minRiskLevel` (toast trigger)
 * - Auto-reconnects on disconnect with exponential backoff capped at 30s
 */
export function usePredictiveAlerts(options: UsePredictiveAlertsOptions = {}) {
  const {
    url = 'ws://localhost:8000/ws/alerts',
    minRiskLevel = 'high',
    onAlert,
    reconnectDelay = 3_000,
    enabled = true,
  } = options;

  const pushAlert = useHospitalStore((s) => s.pushAlert);
  const isLiveMode = useHospitalStore((s) => s.isLiveMode);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Stable callback ref to avoid re-renders
  const onAlertRef = useRef(onAlert);
  onAlertRef.current = onAlert;

  const connect = useCallback(() => {
    if (!enabledRef.current || !isLiveMode) return;

    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.info('[PredictIQ WS] Connected to alert stream');
      attemptRef.current = 0;
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const alert: WsAlertPayload = JSON.parse(event.data);

        // Always push to global store (for badge count)
        pushAlert(alert);

        // Fire toast callback only for sufficiently severe alerts
        const incomingSeverity = RISK_SEVERITY[alert.risk_level] ?? 0;
        const thresholdSeverity = RISK_SEVERITY[minRiskLevel] ?? 2;

        if (incomingSeverity >= thresholdSeverity && onAlertRef.current) {
          onAlertRef.current(alert);
        }
      } catch (err) {
        console.warn('[PredictIQ WS] Failed to parse alert:', err);
      }
    };

    ws.onclose = (event) => {
      console.info(`[PredictIQ WS] Disconnected (code=${event.code})`);
      if (enabledRef.current && isLiveMode) {
        scheduleReconnect();
      }
    };

    ws.onerror = (err) => {
      console.error('[PredictIQ WS] Error:', err);
      ws.close();
    };
  }, [url, isLiveMode, minRiskLevel, pushAlert]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

    // Exponential backoff: delay * 2^attempt, capped at 30s
    const backoff = Math.min(reconnectDelay * 2 ** attemptRef.current, 30_000);
    attemptRef.current += 1;

    console.info(`[PredictIQ WS] Reconnecting in ${backoff}ms (attempt ${attemptRef.current})`);
    reconnectTimer.current = setTimeout(connect, backoff);
  }, [connect, reconnectDelay]);

  // ── Lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    if (enabled && isLiveMode) {
      connect();
    }

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [enabled, isLiveMode, connect]);

  // ── Public API ──────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return {
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
