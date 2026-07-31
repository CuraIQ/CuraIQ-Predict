import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchActivePredictions } from '../endpoints';
import type { PaginatedResponse, PredictionOut, PredictionFilters } from '../types';

export const PREDICTIONS_QUERY_KEY = ['predictions', 'active'] as const;

/**
 * Paginated, filterable query for active AI predictions.
 * The key includes filters so React Query caches per-filter-combination.
 */
export function useActivePredictions(
  filters: PredictionFilters = {},
  options?: Partial<UseQueryOptions<PaginatedResponse<PredictionOut>>>,
) {
  return useQuery<PaginatedResponse<PredictionOut>>({
    queryKey: [...PREDICTIONS_QUERY_KEY, filters],
    queryFn: () => fetchActivePredictions(filters),
    refetchInterval: 15_000,
    ...options,
  });
}
