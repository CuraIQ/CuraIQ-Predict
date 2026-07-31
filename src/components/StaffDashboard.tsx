import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export function StaffDashboard() {
  const [bedCount, setBedCount] = useState(75);
  const [erQueueCount, setErQueueCount] = useState(12);
  const [doctorAvailability, setDoctorAvailability] = useState(15);
  const [isUpdating, setIsUpdating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    const updateBackend = async () => {
      setIsUpdating(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/staff/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bed_count: bedCount,
            er_queue_count: erQueueCount,
            doctor_availability: doctorAvailability
          })
        });
        if (res.ok) {
           const data = await res.json();
           setPrediction(data);
        }
      } catch (err) {
        console.error("Failed to update state:", err);
      } finally {
        setIsUpdating(false);
      }
    };

    const timeoutId = setTimeout(() => {
      updateBackend();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bedCount, erQueueCount, doctorAvailability]);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Staff Control Panel</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Adjust live metrics to simulate AI prediction</p>
        </div>
        {isUpdating && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', animation: 'pulse 1s infinite' }}>Updating AI...</span>}
      </div>

      <div style={{ display: 'grid', gap: '2rem', flex: 1 }}>
        <div className="control-group">
           <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
             <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Bed Occupancy</span>
             <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.25rem' }}>{bedCount}%</span>
           </label>
           <input 
             type="range" min="0" max="100" 
             value={bedCount} 
             onChange={(e) => setBedCount(parseInt(e.target.value))}
             style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)', height: '8px', borderRadius: '4px' }}
           />
        </div>

        <div className="control-group">
           <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
             <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>ER Queue</span>
             <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.25rem' }}>{erQueueCount} waiting</span>
           </label>
           <input 
             type="range" min="0" max="50" 
             value={erQueueCount} 
             onChange={(e) => setErQueueCount(parseInt(e.target.value))}
             style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-warning)', height: '8px', borderRadius: '4px' }}
           />
        </div>

        <div className="control-group">
           <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
             <span style={{ textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Available Doctors</span>
             <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1.25rem' }}>{doctorAvailability}</span>
           </label>
           <input 
             type="range" min="0" max="30" 
             value={doctorAvailability} 
             onChange={(e) => setDoctorAvailability(parseInt(e.target.value))}
             style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-success)', height: '8px', borderRadius: '4px' }}
           />
        </div>
      </div>

      <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
         <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Live AI Analysis</h3>
         {prediction ? (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Predicted Wait Time</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{prediction.wait_time_mins} mins</div>
             </div>
             <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>System Status</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--accent-warning)', lineHeight: 1.2 }}>{prediction.ai_status_message}</div>
             </div>
           </div>
         ) : (
           <p style={{ margin: 0, color: 'var(--text-muted)' }}>Awaiting telemetry data...</p>
         )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
