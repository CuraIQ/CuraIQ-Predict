import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeRecommendation } from '../endpoints';
import { PREDICTIONS_QUERY_KEY } from './useActivePredictions';
import { OVERVIEW_QUERY_KEY } from './useHospitalOverview';
import type {
  PredictionActionRequest,
  PredictionActionResponse,
  PredictionOut,
  PaginatedResponse,
} from '../types';
import { useHospitalStore } from '../../store/useHospitalStore';

interface MutationVariables {
  predictionId: string;
  payload: PredictionActionRequest;
}

interface MutationContext {
  previousQueries: [readonly unknown[], PaginatedResponse<PredictionOut> | undefined][];
}

/**
 * Mutation hook for accepting/dismissing/overriding an AI recommendation.
 * Implements optimistic updates — immediately removes the prediction from
 * the active list and restores it on error.
 */
export function useExecuteRecommendation() {
  const queryClient = useQueryClient();
  const addActionLog = useHospitalStore((s) => s.addActionLog);

  return useMutation<PredictionActionResponse, Error, MutationVariables, MutationContext>({
    mutationFn: ({ predictionId, payload }) => {
      return executeRecommendation(predictionId, payload);
    },

    // ── Optimistic update ──────────────────────────────────────────
    onMutate: async ({ predictionId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: PREDICTIONS_QUERY_KEY });

      // Snapshot previous value for rollback
      const previousQueries = queryClient.getQueriesData<PaginatedResponse<PredictionOut>>({
        queryKey: PREDICTIONS_QUERY_KEY,
      });

      // Optimistically remove the prediction from all cached pages
      queryClient.setQueriesData<PaginatedResponse<PredictionOut>>(
        { queryKey: PREDICTIONS_QUERY_KEY },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== predictionId),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );

      return { previousQueries };
    },

    // ── Rollback on error ──────────────────────────────────────────
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },

    // ── Settle: refetch to ensure server state ────────────────────
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: PREDICTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: OVERVIEW_QUERY_KEY });

      // Log the action to the Zustand store
      if (_data) {
        addActionLog({
          predictionId: variables.predictionId,
          action: variables.payload.action,
          status: _data.status,
          timestamp: _data.actioned_at ?? new Date().toISOString(),
        });
      }
    },
  });
}
