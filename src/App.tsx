import { CustomerView } from './components/CustomerView';
import { StaffDashboard } from './components/StaffDashboard';
import './index.css';

export function App() {
  return (
    <div className="layout-container">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         <CustomerView />
      </div>

      <div className="staff-panel-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         <StaffDashboard />
      </div>
      <style>{`
        .staff-panel-wrapper { display: none !important; }
        @media (min-width: 640px) {
           .staff-panel-wrapper { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
