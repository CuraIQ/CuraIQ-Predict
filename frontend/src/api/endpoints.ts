import apiClient from './client';
import type {
  EnvelopeResponse,
  OverviewSummary,
  PaginatedResponse,
  PredictionOut,
  PredictionActionRequest,
  PredictionActionResponse,
  WardCapacityOut,
  TelemetryIngestRequest,
  TelemetryIngestResponse,
  PredictionFilters,
} from './types';

// ── Overview ─────────────────────────────────────────────────────────
export async function fetchOverviewSummary(): Promise<OverviewSummary> {
  const { data } = await apiClient.get<EnvelopeResponse<OverviewSummary>>('/overview/summary');
  return data.data;
}

// ── Predictions ──────────────────────────────────────────────────────
export async function fetchActivePredictions(
  filters: PredictionFilters = {},
): Promise<PaginatedResponse<PredictionOut>> {
  const params = new URLSearchParams();
  if (filters.risk_level) params.set('risk_level', filters.risk_level);
  if (filters.prediction_type) params.set('prediction_type', filters.prediction_type);
  if (filters.ward_id) params.set('ward_id', filters.ward_id);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.page_size) params.set('page_size', String(filters.page_size));

  const { data } = await apiClient.get<PaginatedResponse<PredictionOut>>(
    `/predictions/active?${params.toString()}`,
  );
  return data;
}

export async function executeRecommendation(
  predictionId: string,
  payload: PredictionActionRequest,
): Promise<PredictionActionResponse> {
  const { data } = await apiClient.post<EnvelopeResponse<PredictionActionResponse>>(
    `/predictions/${predictionId}/action`,
    payload,
  );
  return data.data;
}

// ── Wards ────────────────────────────────────────────────────────────
export async function fetchWardCapacity(): Promise<WardCapacityOut[]> {
  const { data } = await apiClient.get<EnvelopeResponse<WardCapacityOut[]>>('/wards/capacity');
  return data.data;
}

export async function updateWardBeds(wardId: string, action: 'add' | 'remove', amount: number = 1): Promise<WardCapacityOut> {
  const { data } = await apiClient.post<WardCapacityOut>(
    `/wards/${wardId}/beds`,
    { action, amount }
  );
  return data;
}

// ── Inventory ────────────────────────────────────────────────────────
export interface InventoryResponse {
  id: string;
  name: string;
  stock_level: number;
  critical_threshold: number;
  burn_rate_per_day: number;
  forecasted_stockout_date: string | null;
}

export async function fetchInventory(): Promise<InventoryResponse[]> {
  const { data } = await apiClient.get<InventoryResponse[]>('/inventory');
  return data;
}

export async function restockInventory(itemId: string, amount: number): Promise<InventoryResponse> {
  const { data } = await apiClient.post<InventoryResponse>(
    `/inventory/${itemId}/restock`,
    { amount }
  );
  return data;
}

// ── Surge ────────────────────────────────────────────────────────────
export async function triggerSurge(): Promise<{status: string}> {
  const { data } = await apiClient.post<{status: string}>('/surge/trigger');
  return data;
}

// ── Telemetry ────────────────────────────────────────────────────────
export async function ingestTelemetry(
  payload: TelemetryIngestRequest,
): Promise<TelemetryIngestResponse> {
  const { data } = await apiClient.post<EnvelopeResponse<TelemetryIngestResponse>>(
    '/telemetry/ingest',
    payload,
  );
  return data.data;
}
