import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchWardCapacity } from '../endpoints';
import type { WardCapacityOut } from '../types';

export const WARD_CAPACITY_QUERY_KEY = ['ward-capacity'] as const;

/**
 * Fetches live + 24h forecasted ward occupancy.
 * Polls every 60s — ward capacity changes less frequently than alerts.
 */
export function useWardCapacity(
  options?: Partial<UseQueryOptions<WardCapacityOut[]>>,
) {
  return useQuery<WardCapacityOut[]>({
    queryKey: WARD_CAPACITY_QUERY_KEY,
    queryFn: fetchWardCapacity,
    refetchInterval: 60_000,
    ...options,
  });
}
