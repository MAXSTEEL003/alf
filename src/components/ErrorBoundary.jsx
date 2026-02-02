import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you could send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          color: '#1e293b',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(30, 64, 175, 0.1)',
            border: '1px solid rgba(30, 64, 175, 0.1)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              color: '#dc2626'
            }}>
              ⚠️
            </div>
            <h1 style={{ 
              marginBottom: '1rem', 
              color: '#dc2626',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{ 
              marginBottom: '1.5rem', 
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              The application encountered an unexpected error. Please try refreshing the page or go back to the home page.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1E40AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a8a'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1E40AF'}
              >
                🔄 Refresh Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#1E40AF',
                  border: '2px solid #1E40AF',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#1E40AF';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#1E40AF';
                }}
              >
                🏠 Go Home
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '2rem', textAlign: 'left' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#dc2626',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  🐛 Error Details (Development Only)
                </summary>
                <pre style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: '#f1f5f9', 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  overflow: 'auto',
                  marginTop: '0.5rem',
                  border: '1px solid #e2e8f0',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
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

export default ErrorBoundary;