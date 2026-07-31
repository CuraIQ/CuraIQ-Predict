import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { WsAlertPayload, PredictionActionType, PredictionStatus } from '../api/types';

// ── Types ────────────────────────────────────────────────────────────

export interface ActionLogEntry {
  predictionId: string;
  action: PredictionActionType;
  status: PredictionStatus;
  timestamp: string;
}

export interface HospitalState {
  // ── Emergency alerts (populated by WebSocket) ──────────────────
  activeAlerts: WsAlertPayload[];
  alertCount: number;
  unreadAlertCount: number;

  // ── User action audit log ──────────────────────────────────────
  actionLogs: ActionLogEntry[];

  // ── Live mode toggles ──────────────────────────────────────────
  isLiveMode: boolean;
  isEmergencyMode: boolean;

  // ── Alert actions ──────────────────────────────────────────────
  pushAlert: (alert: WsAlertPayload) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  markAlertsRead: () => void;

  // ── Action log ─────────────────────────────────────────────────
  addActionLog: (entry: ActionLogEntry) => void;
  clearActionLogs: () => void;

  // ── Mode toggles ───────────────────────────────────────────────
  toggleLiveMode: () => void;
  setEmergencyMode: (active: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────────────────

const MAX_ALERTS = 100;
const MAX_ACTION_LOGS = 500;

export const useHospitalStore = create<HospitalState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        activeAlerts: [],
        alertCount: 0,
        unreadAlertCount: 0,
        actionLogs: [],
        isLiveMode: true,
        isEmergencyMode: false,

        // ── Alert mutations ────────────────────────────────────────
        pushAlert: (alert) =>
          set((state) => {
            // Deduplicate by id
            const exists = state.activeAlerts.some((a) => a.id === alert.id);
            if (exists) return state;

            const updated = [alert, ...state.activeAlerts].slice(0, MAX_ALERTS);
            return {
              activeAlerts: updated,
              alertCount: updated.length,
              unreadAlertCount: state.unreadAlertCount + 1,
            };
          }),

        removeAlert: (id) =>
          set((state) => {
            const updated = state.activeAlerts.filter((a) => a.id !== id);
            return {
              activeAlerts: updated,
              alertCount: updated.length,
            };
          }),

        clearAlerts: () =>
          set({ activeAlerts: [], alertCount: 0, unreadAlertCount: 0 }),

        markAlertsRead: () => set({ unreadAlertCount: 0 }),

        // ── Action log mutations ───────────────────────────────────
        addActionLog: (entry) =>
          set((state) => ({
            actionLogs: [entry, ...state.actionLogs].slice(0, MAX_ACTION_LOGS),
          })),

        clearActionLogs: () => set({ actionLogs: [] }),

        // ── Mode toggles ───────────────────────────────────────────
        toggleLiveMode: () =>
          set((state) => ({ isLiveMode: !state.isLiveMode })),

        setEmergencyMode: (active) => set({ isEmergencyMode: active }),
      }),
      {
        name: 'predictiq-hospital-store',
        partialize: (state) => ({
          isLiveMode: state.isLiveMode,
          isEmergencyMode: state.isEmergencyMode,
          actionLogs: state.actionLogs.slice(0, 50), // persist only last 50
        }),
      },
    ),
    { name: 'HospitalStore' },
  ),
);
