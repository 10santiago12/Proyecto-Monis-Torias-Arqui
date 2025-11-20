export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56
  };

  const spinnerSize = sizeMap[size];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: '3px solid rgba(42, 77, 138, 0.2)',
          borderTop: '3px solid #2A4D8A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
    </div>
  );
}

export function LoadingSkeleton({ height = '100px', width = '100%' }: { height?: string; width?: string }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: '12px',
        background: 'linear-gradient(90deg, #eef3f9 25%, #e6eef9 37%, #eef3f9 63%)',
        backgroundSize: '400% 100%',
        animation: 'shine 1.2s ease-in-out infinite'
      }}
    >
      <style>{`
        @keyframes shine {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}

export function LoadingOverlay({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(26, 46, 90, 0.8)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        padding: '32px 48px',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,.3)'
      }}>
        <LoadingSpinner size="large" />
        <p style={{ marginTop: '16px', color: '#1A2E5A', fontWeight: '600' }}>{message}</p>
      </div>
    </div>
  );
}
