import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface LiveStatus {
  wait_time_mins: number;
  ai_status_message: string;
  bed_occupancy_rate: number;
}

export function CustomerView() {
  const [status, setStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/customer/live-status`);
        if (res.ok) {
            const data = await res.json();
            setStatus(data);
        }
      } catch (err) {
        console.error("Error fetching live status:", err);
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-primary)', textAlign: 'center' }}>
        Patient Live View
      </h2>
      
      {status ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'space-between' }}>
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            padding: '2rem', 
            borderRadius: '1rem', 
            textAlign: 'center',
            border: `1px solid ${status.wait_time_mins > 60 ? 'var(--accent-danger)' : 'var(--accent-success)'}40`
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Current ER Wait Time
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, color: status.wait_time_mins > 60 ? 'var(--accent-danger)' : 'var(--text-main)' }}>
              {status.wait_time_mins} <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-muted)' }}>mins</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem 1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Bed Occupancy</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{status.bed_occupancy_rate}%</div>
             </div>
             <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem 1rem', borderRadius: '0.75rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI Analysis</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--accent-warning)', lineHeight: 1.2 }}>{status.ai_status_message}</div>
             </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <button className="btn-primary" style={{ width: '100%', fontSize: '1.125rem' }}>
              Check-in Now
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
