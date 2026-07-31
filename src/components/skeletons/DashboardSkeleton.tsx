import React from 'react';

/**
 * Pulsing skeleton placeholder used while dashboard data loads.
 * Renders a grid of skeleton cards mirroring the real dashboard layout.
 */

interface SkeletonProps {
  className?: string;
}

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: '0.75rem',
};

function SkeletonBlock({ className = '' }: SkeletonProps) {
  return <div className={className} style={shimmerStyle} />;
}

export function MetricCardSkeleton() {
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <SkeletonBlock className="skeleton-title" />
      <SkeletonBlock className="skeleton-value" />
      <SkeletonBlock className="skeleton-subtitle" />
      <style>{`
        .skeleton-title { width: 40%; height: 0.875rem; }
        .skeleton-value { width: 60%; height: 2rem; }
        .skeleton-subtitle { width: 80%; height: 0.75rem; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function PredictionRowSkeleton() {
  return (
    <div
      style={{
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        background: 'rgba(30, 41, 59, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div style={{ ...shimmerStyle, width: '3rem', height: '3rem', borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SkeletonBlock className="skeleton-title" />
        <SkeletonBlock className="skeleton-subtitle" />
      </div>
      <div style={{ ...shimmerStyle, width: '5rem', height: '2rem', borderRadius: '0.5rem' }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      {/* Metric cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={`metric-${i}`} />
        ))}
      </div>
      {/* Prediction rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <PredictionRowSkeleton key={`prediction-${i}`} />
        ))}
      </div>
    </div>
  );
}
