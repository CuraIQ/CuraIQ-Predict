import apiClient from './client';
import {
  withMockFallback,
  MOCK_OVERVIEW,
  MOCK_PREDICTIONS_PAGE,
  MOCK_WARD_CAPACITY,
} from './mockData';
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
  return withMockFallback(async () => {
    const { data } = await apiClient.get<EnvelopeResponse<OverviewSummary>>('/overview/summary');
    return data.data;
  }, MOCK_OVERVIEW);
}

// ── Predictions ──────────────────────────────────────────────────────
export async function fetchActivePredictions(
  filters: PredictionFilters = {},
): Promise<PaginatedResponse<PredictionOut>> {
  return withMockFallback(async () => {
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
  }, MOCK_PREDICTIONS_PAGE);
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
  return withMockFallback(async () => {
    const { data } = await apiClient.get<EnvelopeResponse<WardCapacityOut[]>>('/wards/capacity');
    return data.data;
  }, MOCK_WARD_CAPACITY);
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
