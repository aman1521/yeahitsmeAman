import React, { useState, useEffect } from 'react';
import { FiActivity, FiFilter, FiRefreshCw, FiX, FiClock, FiUser, FiPackage, FiShoppingCart, FiTag, FiLogIn, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { formatDateTime } from '../utils/dateUtils';

const UserActions = () => {
  const { theme } = useTheme();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actor_type: '',
    action_type: '',
    user_id: '',
    resource_type: '',
    resource_id: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20, // Show latest 20 logs by default
    offset: 0
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActions();
  }, [filters, pagination.offset]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActions(true); // Silent refresh
      }, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, filters, pagination.offset]);

  const fetchActions = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const params = new URLSearchParams();
      if (filters.actor_type) params.append('actor_type', filters.actor_type);
      if (filters.action_type) params.append('action_type', filters.action_type);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      if (filters.resource_id) params.append('resource_id', filters.resource_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);

      const response = await apiClient.get(`/api/admin/actions?${params.toString()}`);
      if (response.data.success) {
        setActions(response.data.actions || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
        setLastRefresh(new Date());
      } else {
        throw new Error(response.data.error || 'Failed to fetch actions');
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
      console.error('Error details:', error.response?.data);
      // Handle PHP warnings or other errors gracefully
      if (error.response?.data?.error && typeof error.response.data.error === 'string' && 
          (error.response.data.error.includes('PHP') || error.response.data.error.includes('Warning'))) {
        console.warn('PHP warning detected, showing empty list');
        setActions([]);
        setPagination(prev => ({ ...prev, total: 0 }));
        if (!silent) {
          toast.error('Activity logs temporarily unavailable. Showing latest 20 logs.');
        }
      } else if (!silent) {
        toast.error(error.response?.data?.error || 'Failed to load actions');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };


  const getActionIcon = (actionType) => {
    if (actionType.includes('LOGIN')) return <FiLogIn size={16} />;
    if (actionType.includes('LOGOUT')) return <FiLogOut size={16} />;
    if (actionType.includes('PRODUCT')) return <FiPackage size={16} />;
    if (actionType.includes('ORDER')) return <FiShoppingCart size={16} />;
    if (actionType.includes('COUPON')) return <FiTag size={16} />;
    return <FiActivity size={16} />;
  };

  const getActionColor = (actionType) => {
    if (actionType.includes('LOGIN') || actionType.includes('SUCCESS')) return '#22c55e';
    if (actionType.includes('FAILED') || actionType.includes('DELETE')) return '#ef4444';
    if (actionType.includes('CREATE')) return '#3b82f6';
    if (actionType.includes('EDIT') || actionType.includes('UPDATE')) return '#f59e0b';
    return '#6b7280';
  };

  const clearFilters = () => {
    setFilters({
      actor_type: '',
      action_type: '',
      user_id: '',
      resource_type: '',
      resource_id: '',
      start_date: '',
      end_date: ''
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleManualRefresh = () => {
    fetchActions();
    toast.success('Activity log refreshed!', { duration: 1500 });
  };

  return (
    <div className={`page-container ${theme}`}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">
            Complete audit trail of all user actions
            {autoRefresh && (
              <span style={{ color: '#10b981', fontWeight: '500' }}>
                {' • Auto-refreshing every 5s • Last updated: '}
                {lastRefresh.toLocaleTimeString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  hour12: false 
                })}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '5px',
              border: autoRefresh ? 'none' : '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: autoRefresh 
                ? '0 2px 4px rgba(249, 115, 22, 0.2)' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)',
              background: autoRefresh
                ? 'linear-gradient(135deg, #f97316 0%, #facc15 100%)'
                : '#ffffff',
              color: autoRefresh ? '#ffffff' : '#374151',
              minHeight: '32px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!autoRefresh) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!autoRefresh) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }
            }}
          >
            <FiActivity size={12} style={{ 
              animation: autoRefresh ? 'pulse 2s ease-in-out infinite' : 'none',
              flexShrink: 0
            }} /> 
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '5px',
              border: showFilters ? '2px solid #f97316' : '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: showFilters ? '#fff7ed' : '#ffffff',
              color: showFilters ? '#f97316' : '#374151',
              boxShadow: showFilters 
                ? '0 2px 4px rgba(249, 115, 22, 0.15)' 
                : '0 1px 2px rgba(0, 0, 0, 0.05)',
              minHeight: '32px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }
            }}
          >
            <FiFilter size={12} /> Filters
            {showFilters && (
              <span style={{
                marginLeft: '4px',
                padding: '2px 6px',
                borderRadius: '12px',
                background: '#f97316',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                Active
              </span>
            )}
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '5px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: '500',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              background: '#ffffff',
              color: refreshing ? '#9ca3af' : '#374151',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              opacity: refreshing ? 0.6 : 1,
              minHeight: '32px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!refreshing) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }
            }}
          >
            <FiRefreshCw 
              size={12} 
              style={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                transform: refreshing ? 'rotate(360deg)' : 'none',
                flexShrink: 0
              }} 
            /> 
            Refresh
          </button>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Filter Actions</h3>
            <button onClick={clearFilters} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiX /> Clear
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>User Type</label>
              <select
                value={filters.actor_type}
                onChange={(e) => setFilters(prev => ({ ...prev, actor_type: e.target.value }))}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Types</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Action Type</label>
              <select
                value={filters.action_type}
                onChange={(e) => setFilters(prev => ({ ...prev, action_type: e.target.value }))}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Actions</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_ATTEMPT_FAILED">Login Failed</option>
                <option value="LOGOUT">Logout</option>
                <option value="ADMIN_CREATE_PRODUCT">Create Product</option>
                <option value="ADMIN_EDIT_PRODUCT">Edit Product</option>
                <option value="ADMIN_UPDATE_ORDER_STATUS">Update Order</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Resource Type</label>
              <select
                value={filters.resource_type}
                onChange={(e) => setFilters(prev => ({ ...prev, resource_type: e.target.value }))}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Resources</option>
                <option value="product">Product</option>
                <option value="order">Order</option>
                <option value="coupon">Coupon</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>User ID</label>
              <input
                type="number"
                value={filters.user_id}
                onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                placeholder="Filter by user ID"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Start Date</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>End Date</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)' }}>
            <FiActivity size={24} color="#3b82f6" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Total Actions</p>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: '600' }}>{pagination.total}</h3>
          </div>
        </div>
      </div>

      {/* Actions Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading actions...</div>
        ) : actions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No actions found
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Action</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Resource</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Details</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((action) => (
                    <tr key={action.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiClock size={14} color="#6b7280" />
                          {action.timestamp ? formatDateTime(action.timestamp) : 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiUser size={14} />
                            <span style={{ fontWeight: '500' }}>ID: {action.user_id || 'Guest'}</span>
                          </div>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            background: action.actor_type === 'admin' ? 'rgba(239, 68, 68, 0.1)' : action.actor_type === 'customer' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: action.actor_type === 'admin' ? '#dc2626' : action.actor_type === 'customer' ? '#2563eb' : '#6b7280'
                          }}>
                            {action.actor_type}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: getActionColor(action.action_type) }}>
                            {getActionIcon(action.action_type)}
                          </span>
                          <span style={{ fontWeight: '500' }}>{action.action_label || action.action_type}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {action.resource_label ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {(action.resource_type === 'product' || (action.resource_label || '').toLowerCase().includes('product')) && <FiPackage size={14} />}
                            {(action.resource_type === 'order' || (action.resource_label || '').toLowerCase().includes('order')) && <FiShoppingCart size={14} />}
                            <span>{action.resource_label}</span>
                          </div>
                        ) : action.resource_type && action.resource_id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {action.resource_type === 'product' && <FiPackage size={14} />}
                            {action.resource_type === 'order' && <FiShoppingCart size={14} />}
                            <span>{action.resource_type} #{action.resource_id}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', maxWidth: '300px' }}>
                        {action.action_details && typeof action.action_details === 'object' ? (
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {JSON.stringify(action.action_details, null, 2).substring(0, 100)}...
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>{action.action_details?.substring(0, 50) || '—'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {action.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} actions
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                    disabled={pagination.offset === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: pagination.offset === 0 ? '#f3f4f6' : '#ffffff',
                      color: pagination.offset === 0 ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.offset !== 0) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.offset !== 0) {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    <FiChevronLeft size={16} />
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '0 12px',
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
                  </div>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: pagination.offset + pagination.limit >= pagination.total ? '#f3f4f6' : '#ffffff',
                      color: pagination.offset + pagination.limit >= pagination.total ? '#9ca3af' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: pagination.offset + pagination.limit >= pagination.total ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (pagination.offset + pagination.limit < pagination.total) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pagination.offset + pagination.limit < pagination.total) {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserActions;

