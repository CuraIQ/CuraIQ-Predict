/**
 * Fallback mock data used when the FastAPI backend is unreachable.
 * Shapes match backend Pydantic schemas exactly.
 */

import type {
  OverviewSummary,
  PaginatedResponse,
  PredictionOut,
  WardCapacityOut,
} from './types';

const NOW = new Date().toISOString();
const HOSPITAL_ID = '11111111-1111-1111-1111-111111111111';

export const MOCK_OVERVIEW: OverviewSummary = {
  beds: {
    total_beds: 500,
    occupied_beds: 427,
    available_beds: 73,
    occupancy_rate: 85.4,
  },
  staff: {
    total_staff: 140,
    on_duty: 95,
    off_duty: 35,
    on_break: 6,
    on_leave: 4,
  },
  inventory: {
    total_items: 5,
    items_below_threshold: 3,
    critical_items: 1,
  },
  risk: {
    critical: 2,
    high: 2,
    medium: 1,
    low: 0,
    total_active: 5,
  },
  generated_at: NOW,
};

const INITIAL_PREDICTIONS: PredictionOut[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001',
    prediction_type: 'bed_overflow',
    ward_id: '22222222-2222-2222-2222-222222222203',
    item_id: null,
    risk_score: 0.94,
    risk_level: 'critical',
    forecasted_event: 'General Ward projected at 96% capacity within 4 hours',
    target_timestamp: new Date(Date.now() + 4 * 3600_000).toISOString(),
    recommended_action: 'Trigger Ward B reserve bed allocation and early discharge protocol',
    status: 'active',
    created_at: NOW,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002',
    prediction_type: 'inventory_stockout',
    ward_id: null,
    item_id: '33333333-3333-3333-3333-333333333301',
    risk_score: 0.91,
    risk_level: 'critical',
    forecasted_event: 'IV Fluids stock projected to deplete in 1.8 days',
    target_timestamp: new Date(Date.now() + 2 * 86400_000).toISOString(),
    recommended_action: 'Initiate emergency stock reorder for IV Fluids',
    status: 'active',
    created_at: NOW,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003',
    prediction_type: 'staff_shortage',
    ward_id: '22222222-2222-2222-2222-222222222201',
    item_id: null,
    risk_score: 0.78,
    risk_level: 'high',
    forecasted_event: 'ICU night shift understaffed by 3 nurses in 6 hours',
    target_timestamp: new Date(Date.now() + 6 * 3600_000).toISOString(),
    recommended_action: 'Call in on-call nursing pool and reassign 2 float nurses',
    status: 'active',
    created_at: NOW,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004',
    prediction_type: 'patient_surge',
    ward_id: '22222222-2222-2222-2222-222222222202',
    item_id: null,
    risk_score: 0.72,
    risk_level: 'high',
    forecasted_event: 'ER arrival surge expected (+35%) between 20:00–02:00',
    target_timestamp: new Date(Date.now() + 3 * 3600_000).toISOString(),
    recommended_action: 'Activate surge tent protocol and pre-position triage staff',
    status: 'active',
    created_at: NOW,
  },
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005',
    prediction_type: 'inventory_stockout',
    ward_id: null,
    item_id: '33333333-3333-3333-3333-333333333303',
    risk_score: 0.97,
    risk_level: 'critical',
    forecasted_event: 'ICU Sedatives at zero stock — immediate replenishment required',
    target_timestamp: new Date(Date.now() + 3600_000).toISOString(),
    recommended_action: 'Emergency pharmacy transfer from central supply',
    status: 'active',
    created_at: NOW,
  },
];

const INITIAL_WARD_CAPACITY: WardCapacityOut[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    ward_name: 'Intensive Care Unit',
    ward_type: 'icu',
    hospital_id: HOSPITAL_ID,
    capacity: 50,
    total_beds: 50,
    occupied_beds: 44,
    available_beds: 6,
    occupancy_rate: 88.0,
    forecasted_occupied_24h: 47,
    forecasted_occupancy_rate_24h: 94.0,
    risk_flag: 'red',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    ward_name: 'Emergency Department',
    ward_type: 'emergency',
    hospital_id: HOSPITAL_ID,
    capacity: 50,
    total_beds: 50,
    occupied_beds: 41,
    available_beds: 9,
    occupancy_rate: 82.0,
    forecasted_occupied_24h: 44,
    forecasted_occupancy_rate_24h: 88.0,
    risk_flag: 'amber',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    ward_name: 'General Medicine',
    ward_type: 'general',
    hospital_id: HOSPITAL_ID,
    capacity: 250,
    total_beds: 250,
    occupied_beds: 218,
    available_beds: 32,
    occupancy_rate: 87.2,
    forecasted_occupied_24h: 235,
    forecasted_occupancy_rate_24h: 94.0,
    risk_flag: 'red',
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    ward_name: 'Surgical Ward',
    ward_type: 'surgical',
    hospital_id: HOSPITAL_ID,
    capacity: 100,
    total_beds: 100,
    occupied_beds: 88,
    available_beds: 12,
    occupancy_rate: 88.0,
    forecasted_occupied_24h: 82,
    forecasted_occupancy_rate_24h: 82.0,
    risk_flag: 'amber',
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    ward_name: 'Pediatrics',
    ward_type: 'pediatric',
    hospital_id: HOSPITAL_ID,
    capacity: 50,
    total_beds: 50,
    occupied_beds: 36,
    available_beds: 14,
    occupancy_rate: 72.0,
    forecasted_occupied_24h: 38,
    forecasted_occupancy_rate_24h: 76.0,
    risk_flag: 'green',
  },
];

// LocalStorage DB for Mocks
export function getMockPredictions(): PredictionOut[] {
  const data = localStorage.getItem('curaiq_mock_predictions');
  if (data) return JSON.parse(data);
  localStorage.setItem('curaiq_mock_predictions', JSON.stringify(INITIAL_PREDICTIONS));
  return INITIAL_PREDICTIONS;
}

export function setMockPredictions(predictions: PredictionOut[]) {
  localStorage.setItem('curaiq_mock_predictions', JSON.stringify(predictions));
}

export function getMockWardCapacity(): WardCapacityOut[] {
  const data = localStorage.getItem('curaiq_mock_wards');
  if (data) return JSON.parse(data);
  localStorage.setItem('curaiq_mock_wards', JSON.stringify(INITIAL_WARD_CAPACITY));
  return INITIAL_WARD_CAPACITY;
}

export function setMockWardCapacity(wards: WardCapacityOut[]) {
  localStorage.setItem('curaiq_mock_wards', JSON.stringify(wards));
}

export const MOCK_PREDICTIONS_PAGE = (): PaginatedResponse<PredictionOut> => {
  const data = getMockPredictions();
  return {
    data,
    meta: { page: 1, page_size: 20, total: data.length, total_pages: 1 },
  };
};

/** Tracks whether the app is currently serving mock data. */
let usingMockData = false;

export function isUsingMockData(): boolean {
  return usingMockData;
}

export function setUsingMockData(value: boolean): void {
  usingMockData = value;
}

export async function withMockFallback<T>(
  fetcher: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    const result = await fetcher();
    setUsingMockData(false);
    return result;
  } catch (err) {
    console.warn('[PredictIQ] Backend unreachable — using mock data.', err);
    setUsingMockData(true);
    return fallback();
  }
}
