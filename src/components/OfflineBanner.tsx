export function OfflineBanner() {
  return (
    <div
      role="status"
      style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        background: 'rgba(234, 179, 8, 0.12)',
        border: '1px solid rgba(234, 179, 8, 0.4)',
        color: '#fde68a',
        fontSize: '0.875rem',
      }}
    >
      Demo mode: backend unreachable — displaying fallback mock data.
    </div>
  );
}
