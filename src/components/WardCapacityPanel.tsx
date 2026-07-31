import type { WardCapacityOut, RiskFlag } from '../api/types';

interface WardCapacityPanelProps {
  wards: WardCapacityOut[];
  isLoading?: boolean;
}

const FLAG_COLORS: Record<RiskFlag, string> = {
  green: '#22c55e',
  amber: '#eab308',
  red: '#ef4444',
};

export function WardCapacityPanel({ wards, isLoading }: WardCapacityPanelProps) {
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
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Ward Capacity</h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          Live occupancy + 24h forecast
          {isLoading && ' · refreshing…'}
        </p>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {wards.map((w) => (
          <div
            key={w.id}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.75rem',
              background: 'rgba(15, 23, 42, 0.6)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{w.ward_name}</div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                {w.occupied_beds}/{w.total_beds} beds · {w.occupancy_rate}% now
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: FLAG_COLORS[w.risk_flag],
                  background: `${FLAG_COLORS[w.risk_flag]}22`,
                }}
              >
                {w.risk_flag}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                24h: {w.forecasted_occupancy_rate_24h}%
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background: '#1e293b',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(w.forecasted_occupancy_rate_24h, 100)}%`,
                    background: FLAG_COLORS[w.risk_flag],
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
