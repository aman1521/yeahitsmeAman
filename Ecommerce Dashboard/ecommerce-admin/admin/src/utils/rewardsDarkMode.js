/**
 * Dark mode utility functions and styles for Rewards Management components
 */

export const getThemeStyles = (isDark) => ({
  card: {
    background: isDark ? '#1e293b' : 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
    border: isDark ? '1px solid #334155' : 'none',
    color: isDark ? '#e2e8f0' : '#1e293b',
    transition: 'background-color 0.3s ease, border-color 0.3s ease'
  },
  input: {
    background: isDark ? '#334155' : 'white',
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    color: isDark ? '#e2e8f0' : '#1e293b',
    padding: '12px 16px 12px 48px',
    borderRadius: '8px',
    width: '100%',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  inputFocus: {
    border: '1px solid #3b82f6',
    outline: 'none'
  },
  table: {
    background: isDark ? '#1e293b' : 'white',
    width: '100%',
    borderCollapse: 'collapse',
    color: isDark ? '#e2e8f0' : '#1e293b'
  },
  tableHeader: {
    background: isDark ? '#334155' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#475569',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    padding: '12px',
    textAlign: 'left',
    borderBottom: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`
  },
  tableRow: {
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    transition: 'background-color 0.2s ease'
  },
  tableRowHover: {
    background: isDark ? '#334155' : '#f8fafc'
  },
  tableCell: {
    padding: '12px',
    color: isDark ? '#e2e8f0' : '#1e293b',
    fontSize: '14px'
  },
  button: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  buttonPrimary: {
    background: '#3b82f6',
    color: 'white'
  },
  buttonSecondary: {
    background: isDark ? '#334155' : '#f1f5f9',
    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
    color: isDark ? '#e2e8f0' : '#475569'
  },
  textPrimary: {
    color: isDark ? '#e2e8f0' : '#1e293b'
  },
  textSecondary: {
    color: isDark ? '#cbd5e1' : '#64748b'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  modal: {
    background: isDark ? '#1e293b' : 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    color: isDark ? '#e2e8f0' : '#1e293b',
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)'
  },
  modalOverlay: {
    background: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
  }
});



