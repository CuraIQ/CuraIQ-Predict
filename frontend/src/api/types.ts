/**
 * TypeScript interfaces mirroring the PredictIQ Pydantic v2 schemas.
 * Kept in strict 1:1 correspondence with the backend.
 */

// ── Envelope types ───────────────────────────────────────────────────
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface EnvelopeResponse<T> {
  data: T;
  request_id?: string | null;
}

// ── Overview ─────────────────────────────────────────────────────────
export interface BedSummary {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
}

export interface StaffSummary {
  total_staff: number;
  on_duty: number;
  off_duty: number;
  on_break: number;
  on_leave: number;
}

export interface InventoryAlert {
  total_items: number;
  items_below_threshold: number;
  critical_items: number;
}

export interface RiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total_active: number;
}

export interface OverviewSummary {
  beds: BedSummary;
  staff: StaffSummary;
  inventory: InventoryAlert;
  risk: RiskBreakdown;
  generated_at: string;
}

// ── Predictions ──────────────────────────────────────────────────────
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type PredictionType =
  | 'bed_overflow'
  | 'inventory_stockout'
  | 'staff_shortage'
  | 'equipment_failure'
  | 'patient_surge';

export type PredictionStatus = 'active' | 'accepted' | 'dismissed' | 'overridden' | 'resolved';

export type PredictionActionType = 'accept' | 'dismiss' | 'override';

export interface PredictionOut {
  id: string;
  prediction_type: PredictionType;
  ward_id: string | null;
  item_id: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  forecasted_event: string;
  target_timestamp: string;
  recommended_action: string | null;
  status: PredictionStatus;
  created_at: string;
}

export interface PredictionActionRequest {
  action: PredictionActionType;
  notes?: string | null;
}

export interface PredictionActionResponse {
  id: string;
  status: PredictionStatus;
  action_notes: string | null;
  actioned_at: string | null;
}

// ── Wards ────────────────────────────────────────────────────────────
export type RiskFlag = 'green' | 'amber' | 'red';

export interface WardCapacityOut {
  id: string;
  ward_name: string;
  ward_type: string;
  hospital_id: string;
  capacity: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
  forecasted_occupied_24h: number;
  forecasted_occupancy_rate_24h: number;
  risk_flag: RiskFlag;
}

// ── Telemetry ────────────────────────────────────────────────────────
export interface TelemetryRecord {
  hospital_id: string;
  ward_id?: string | null;
  metric_name: string;
  metric_value: number;
  unit?: string | null;
  recorded_at?: string | null;
}

export interface TelemetryIngestRequest {
  records: TelemetryRecord[];
}

export interface TelemetryIngestResponse {
  ingested: number;
  message: string;
}

// ── WebSocket Alert Payload ──────────────────────────────────────────
export interface WsAlertPayload {
  id: string;
  prediction_type: PredictionType;
  risk_score: number;
  risk_level: RiskLevel;
  forecasted_event: string;
  target_timestamp: string;
  recommended_action: string | null;
  ward_id: string | null;
}

// ── Filters ──────────────────────────────────────────────────────────
export interface PredictionFilters {
  risk_level?: RiskLevel;
  prediction_type?: PredictionType;
  ward_id?: string;
  page?: number;
  page_size?: number;
}
