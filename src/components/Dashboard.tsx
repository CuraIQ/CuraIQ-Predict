import { isUsingMockData } from '../api/mockData';
import { useHospitalOverview, useActivePredictions, useWardCapacity } from '../api/hooks';
import { DashboardSkeleton } from './skeletons/DashboardSkeleton';
import { MetricCard } from './MetricCard';
import { PredictionsPanel } from './PredictionsPanel';
import { WardCapacityPanel } from './WardCapacityPanel';
import { OfflineBanner } from './OfflineBanner';

export function Dashboard() {
  const overview = useHospitalOverview();
  const predictions = useActivePredictions();
  const wards = useWardCapacity();

  const isLoading = overview.isLoading || predictions.isLoading || wards.isLoading;
  const hasError = overview.isError && predictions.isError && wards.isError;

  if (isLoading && !overview.data) {
    return <DashboardSkeleton />;
  }

  if (hasError && !overview.data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <h2>Unable to load dashboard</h2>
        <p>Check that the backend is running at http://localhost:8000</p>
      </div>
    );
  }

  const summary = overview.data!;
  const predictionList = predictions.data?.data ?? [];
  const wardList = wards.data ?? [];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              PredictIQ
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
              Hospital Operations Intelligence — Live Dashboard
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Updated {new Date(summary.generated_at).toLocaleTimeString()}
          </div>
        </div>
        {isUsingMockData() && <OfflineBanner />}
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <MetricCard
          label="Bed Occupancy"
          value={`${summary.beds.occupancy_rate}%`}
          sub={`${summary.beds.occupied_beds} / ${summary.beds.total_beds} beds occupied`}
          accent="#38bdf8"
        />
        <MetricCard
          label="Staff On Duty"
          value={String(summary.staff.on_duty)}
          sub={`${summary.staff.total_staff} total · ${summary.staff.on_break} on break`}
          accent="#a78bfa"
        />
        <MetricCard
          label="Inventory Alerts"
          value={String(summary.inventory.items_below_threshold)}
          sub={`${summary.inventory.critical_items} critical stockouts`}
          accent="#fb923c"
        />
        <MetricCard
          label="Active AI Alerts"
          value={String(summary.risk.total_active)}
          sub={`${summary.risk.critical} critical · ${summary.risk.high} high`}
          accent="#f87171"
        />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <PredictionsPanel predictions={predictionList} isLoading={predictions.isFetching} />
        <WardCapacityPanel wards={wardList} isLoading={wards.isFetching} />
      </div>
    </div>
  );
}
