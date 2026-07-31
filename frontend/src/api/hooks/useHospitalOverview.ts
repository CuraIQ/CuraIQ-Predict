import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchOverviewSummary } from '../endpoints';
import type { OverviewSummary } from '../types';

/** Stale-while-revalidate polling key */
export const OVERVIEW_QUERY_KEY = ['hospital-overview'] as const;

/**
 * Fetches aggregated hospital metrics (beds, staff, inventory, risk).
 * Auto-refetches every 30s to keep the dashboard fresh.
 */
export function useHospitalOverview(
  options?: Partial<UseQueryOptions<OverviewSummary>>,
) {
  return useQuery<OverviewSummary>({
    queryKey: OVERVIEW_QUERY_KEY,
    queryFn: fetchOverviewSummary,
    refetchInterval: 30_000,
    ...options,
  });
}
