import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-primary, #f8fafc)'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px auto'
            }}>
              <FiAlertTriangle />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              Something went wrong
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
              An unexpected display error occurred in this view. Your business data remains safe.
            </p>

            {this.state.error && (
              <div style={{
                background: '#f1f5f9',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#475569',
                textAlign: 'left',
                fontFamily: 'monospace',
                marginBottom: '20px',
                overflowX: 'auto'
              }}>
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  background: '#168CD6',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FiRefreshCw />
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = (process.env.PUBLIC_URL || '') + '/'; }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: '600',
                  fontSize: '13px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                <FiHome />
                Dashboard Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

