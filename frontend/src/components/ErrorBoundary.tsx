import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(180deg, #1A2E5A 0%, #2A4D8A 55%, #E6F0FA 100%)',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,.18)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ color: '#1A2E5A', marginBottom: '12px' }}>Algo salió mal</h1>
            <p style={{ color: '#475569', marginBottom: '24px' }}>
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(90deg, #2A4D8A, #1A2E5A)',
                color: '#fff',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              Recargar página
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '700', marginBottom: '8px' }}>
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre style={{
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: '#dc2626'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
