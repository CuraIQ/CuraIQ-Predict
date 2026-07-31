interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  accent: string;
}

export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
        {sub}
      </div>
    </div>
  );
}
