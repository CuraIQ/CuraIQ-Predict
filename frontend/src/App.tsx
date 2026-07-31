import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StaffLayout } from './layouts/StaffLayout';

// Pages
import { PatientView } from './pages/PatientView';
import { LoginPage } from './pages/LoginPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { WardsIntelligence } from './pages/WardsIntelligence';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { InventoryIntelligence } from './pages/InventoryIntelligence';
import { AlertsAndAdmin } from './pages/AlertsAndAdmin';

// Protection
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Guest Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PatientView />} />
        </Route>

        {/* Staff Authentication */}
        <Route path="/login" element={<PublicLayout />}>
          <Route index element={<LoginPage />} />
        </Route>

        {/* Protected Staff Control Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="wards" element={<WardsIntelligence />} />
          <Route path="inventory" element={<InventoryIntelligence />} />
          <Route path="alerts" element={<AlertsAndAdmin />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
