import { useExecuteRecommendation } from '../api/hooks';
import type { PredictionOut, RiskLevel } from '../api/types';

interface PredictionsPanelProps {
  predictions: PredictionOut[];
  isLoading?: boolean;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export function PredictionsPanel({ predictions, isLoading }: PredictionsPanelProps) {
  const { mutate, isPending, variables } = useExecuteRecommendation();

  const handleAccept = (predictionId: string) => {
    mutate({ predictionId, payload: { action: 'accept', notes: 'Accepted via dashboard' } });
  };

  return (
    <section
      style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '1rem',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Active AI Predictions</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          {predictions.length} alert{predictions.length !== 1 ? 's' : ''} requiring attention
          {isLoading && ' · refreshing…'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
        {predictions.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No active predictions</p>
        ) : (
          predictions.map((p) => {
            const isAccepting = isPending && variables?.predictionId === p.id;
            return (
              <div
                key={p.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderLeft: `3px solid ${RISK_COLORS[p.risk_level]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: RISK_COLORS[p.risk_level],
                      }}
                    >
                      {p.risk_level} · {p.prediction_type.replace(/_/g, ' ')}
                    </span>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#e2e8f0' }}>
                      {p.forecasted_event}
                    </p>
                    {p.recommended_action && (
                      <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        {p.recommended_action}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: RISK_COLORS[p.risk_level], whiteSpace: 'nowrap' }}>
                    {(p.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleAccept(p.id)}
                    disabled={isAccepting}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: isAccepting ? '#334155' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      opacity: isAccepting ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {isAccepting ? 'Accepting…' : 'Accept AI Recommendation'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
