import React, { useState, useEffect, useRef } from 'react';
import { FiActivity, FiClock, FiMonitor, FiMapPin, FiUser, FiLogOut, FiFilter, FiRefreshCw, FiX, FiAlertCircle, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const UserSessions = () => {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_sessions: 0,
    active_sessions: 0,
    admin_sessions: 0
  });
  const [filters, setFilters] = useState({
    actor_type: '',
    session_type: '',
    is_active: '',
    user_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0
  });
  const autoRefreshInterval = useRef(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    fetchSessions();
    
    // Auto-refresh every 30 seconds
    if (autoRefreshEnabled) {
      autoRefreshInterval.current = setInterval(() => {
        fetchSessions(true); // Silent refresh
      }, 30000);
    }
    
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [filters, pagination.offset, autoRefreshEnabled]);

  const fetchSessions = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const params = new URLSearchParams();
      if (filters.actor_type) params.append('actor_type', filters.actor_type);
      if (filters.session_type) params.append('session_type', filters.session_type);
      if (filters.is_active !== '') params.append('is_active', filters.is_active);
      if (filters.user_id) params.append('user_id', filters.user_id);
      params.append('limit', pagination.limit);
      params.append('offset', pagination.offset);

      const queryString = params.toString();
      console.log('[DEBUG] Fetching sessions with filters:', {
        actor_type: filters.actor_type,
        session_type: filters.session_type,
        is_active: filters.is_active,
        user_id: filters.user_id,
        queryString: queryString
      });
      
      const response = await apiClient.get(`/admin/sessions?${queryString}`);
      console.log('[DEBUG] API response:', {
        success: response.data.success,
        total: response.data.total,
        sessions_count: response.data.sessions?.length || 0,
        stats: response.data.stats
      });
      
      if (response.data.success) {
        // Debug: Log first session to see what data we're getting
        if (response.data.sessions && response.data.sessions.length > 0) {
          console.log('[DEBUG] First session from API:', JSON.stringify(response.data.sessions[0], null, 2));
          console.log('[DEBUG] login_at:', response.data.sessions[0].login_at, 'type:', typeof response.data.sessions[0].login_at);
          console.log('[DEBUG] last_seen_at:', response.data.sessions[0].last_seen_at, 'type:', typeof response.data.sessions[0].last_seen_at);
          console.log('[DEBUG] created_at:', response.data.sessions[0].created_at);
          console.log('[DEBUG] entry_time:', response.data.sessions[0].entry_time);
          console.log('[DEBUG] last_activity:', response.data.sessions[0].last_activity);
          console.log('[DEBUG] user_id:', response.data.sessions[0].user_id, 'type:', typeof response.data.sessions[0].user_id);
          console.log('[DEBUG] actor_type:', response.data.sessions[0].actor_type);
          console.log('[DEBUG] session_type:', response.data.sessions[0].session_type);
          console.log('[DEBUG] is_active:', response.data.sessions[0].is_active, 'type:', typeof response.data.sessions[0].is_active);
          console.log('[DEBUG] terminated_by_admin:', response.data.sessions[0].terminated_by_admin, 'type:', typeof response.data.sessions[0].terminated_by_admin);
        }
        console.log('[DEBUG] Stats from API:', response.data.stats);
        
        // Ensure is_active is a boolean (handle both 0/1 and true/false)
        // Also ensure terminated_by_admin is boolean
        // CRITICAL: Convert properly - 0/1 from SQL CASE statement need explicit conversion
        // CRITICAL: If terminated_by_admin is true, is_active MUST be false
        const sessionsWithBoolActive = (response.data.sessions || []).map(session => {
          // Convert terminated_by_admin FIRST
          let terminatedByAdmin = false;
          if (session.terminated_by_admin === 1 || session.terminated_by_admin === true || session.terminated_by_admin === '1' || session.terminated_by_admin === 'true') {
            terminatedByAdmin = true;
          }
          
          // Convert is_active: SQL returns 1 or 0, need to check explicitly
          // BUT: If terminated_by_admin is true, force is_active = false
          // TRUST THE BACKEND: The backend SQL query already calculates is_active correctly
          // Only override if terminated_by_admin is true
          let isActive = false;
          if (terminatedByAdmin) {
            // Terminated sessions are always inactive
            isActive = false;
          } else {
            // Trust the backend calculation - it already checks last_activity vs 30 minutes
            // The backend SQL: CASE WHEN terminated_by_admin = 1 THEN 0 WHEN last_activity > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30 MINUTE) THEN 1 ELSE 0 END
            // So if backend says is_active = 1, trust it (unless terminated_by_admin is true)
            if (session.is_active === 1 || session.is_active === true || session.is_active === '1' || session.is_active === 'true') {
              isActive = true;
            } else {
              isActive = false;
            }
          }
          
          console.log(`[DEBUG] Session ${session.id}: is_active=${session.is_active} (${typeof session.is_active}) -> ${isActive}, terminated_by_admin=${session.terminated_by_admin} (${typeof session.terminated_by_admin}) -> ${terminatedByAdmin}, last_seen_at=${session.last_seen_at}`);
          
          return {
            ...session,
            is_active: isActive,
            terminated_by_admin: terminatedByAdmin
          };
        });
        setSessions(sessionsWithBoolActive);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
        // Update stats from API if provided
        if (response.data.stats) {
          console.log('[DEBUG] Setting stats:', response.data.stats);
          setStats({
            total_sessions: response.data.stats.total_sessions || 0,
            active_sessions: response.data.stats.active_sessions || 0,
            admin_sessions: response.data.stats.active_admin_sessions || response.data.stats.admin_sessions || 0  // Show active admin sessions
          });
        } else {
          console.warn('[DEBUG] No stats in API response:', response.data);
        }
        if (silent) {
          // Silent refresh - no toast notification
        } else if (sessions.length === 0 && response.data.sessions.length > 0) {
          toast.success(`Loaded ${response.data.sessions.length} sessions`);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      if (!silent) {
        toast.error(error.response?.data?.error || 'Failed to load sessions');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCloseSession = async (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    const userName = session?.user_name || (session?.user_id ? `User ID: ${session.user_id}` : 'this session');
    
    if (!window.confirm(`Are you sure you want to force close session for ${userName}? The user will be logged out immediately.`)) {
      return;
    }

    try {
      // Get the session_id of the session being closed (from the session object)
      const sessionBeingClosedId = session?.session_id;
      // Get the current session_id from localStorage (the session the admin is currently using)
      const currentSessionId = localStorage.getItem('sessionId');
      
      console.log(`[DEBUG] Closing session: db_id=${sessionId}, session_being_closed_id=${sessionBeingClosedId}, current_session_id_from_localStorage=${currentSessionId}`);
      
      // Send current session_id to backend so it can determine if this is the current session
      const response = await apiClient.post(`/admin/sessions/${sessionId}/close`, {
        current_session_id: currentSessionId  // Send the CURRENT session_id, not the one being closed
      });
      
      if (response.data.success) {
        // If this is the current session, force logout
        console.log(`[DEBUG] Close response:`, response.data);
        if (response.data.force_logout || response.data.session_expired) {
          console.log(`[DEBUG] Force logout triggered for session ${sessionId}`);
          // react-hot-toast does not have a built-in 'warning' helper; use toast() with a custom style
          toast('Your session has been closed. Logging out...', {
            icon: '⚠️'
          });
          // Clear auth data immediately
          localStorage.removeItem('token');
          localStorage.removeItem('sessionId');
          // Redirect to login immediately (no delay)
          window.location.href = '/login';
          return;
        }

        // Safety net: if backend didn't flag force_logout but we just closed
        // the session that matches the current browser session_id, still log out.
        // CRITICAL: Only compare if both values exist and match exactly
        const isCurrentSession = (
          currentSessionId && 
          sessionBeingClosedId && 
          String(sessionBeingClosedId).trim() === String(currentSessionId).trim()
        );
        
        if (
          !response.data.force_logout &&
          !response.data.session_expired &&
          isCurrentSession
        ) {
          console.log('[DEBUG] Force logout via client-side safety check (session_id match)', {
            sessionBeingClosedId,
            currentSessionId,
            match: isCurrentSession
          });
          toast('Your session has been closed. Logging out...', {
            icon: '⚠️'
          });
          localStorage.removeItem('token');
          localStorage.removeItem('sessionId');
          window.location.href = '/login';
          return;
        }
        
        // If NOT the current session, just show success message
        if (!isCurrentSession) {
          console.log('[DEBUG] Closed other session (not current), no logout needed', {
            sessionBeingClosedId,
            currentSessionId
          });
        }

        // Force immediate refresh to show updated status
        // Wait a bit to ensure backend has processed the update
        await new Promise(resolve => setTimeout(resolve, 200));
        await fetchSessions(true); // Silent refresh to avoid duplicate notifications
        toast.success('Session closed successfully');
      } else {
        toast.error(response.data.error || 'Failed to close session');
      }
    } catch (error) {
      console.error('Error closing session:', error);
      
      // Check if response exists and has success=true (might be in error.response.data)
      if (error.response?.data?.success === true) {
        // Backend returned success but frontend caught it as error (network issue, etc.)
        console.log('[DEBUG] Backend returned success but caught as error:', error.response.data);
        if (error.response.data.force_logout || error.response.data.session_expired) {
          console.log(`[DEBUG] Force logout triggered for session ${sessionId}`);
          toast('Your session has been closed. Logging out...', {
            icon: '⚠️'
          });
          localStorage.removeItem('token');
          localStorage.removeItem('sessionId');
          window.location.href = '/login';
          return;
        }
        // Success but no force logout - just refresh
        await new Promise(resolve => setTimeout(resolve, 200));
        await fetchSessions(true);
        toast.success('Session closed successfully');
        return;
      }
      
      // If we get a 401 with session_expired, logout
      if (error.response?.status === 401 && error.response?.data?.session_expired) {
        toast('Your session has expired. Logging out...', {
          icon: '⚠️'
        });
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return;
      }
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to close session';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      // Handle both Date objects and date strings
      let date;
      if (dateInput instanceof Date) {
        // If it's already a Date object, use it directly
        date = dateInput;
      } else if (typeof dateInput === 'string') {
        // Backend sends UTC timestamps in ISO format (e.g., '2025-12-27T11:44:09.123456' or '2025-12-27T11:44:09+00:00')
        // Parse as UTC and convert to IST for display
        if (dateInput.includes('Z') || dateInput.endsWith('+00:00') || dateInput.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/)) {
          // UTC timestamp - parse and convert to IST
          // Remove 'Z' or '+00:00' if present, then parse as UTC
          let utcString = dateInput.replace('Z', '').replace('+00:00', '');
          // If no timezone info, assume UTC
          if (!utcString.includes('+') && !utcString.includes('-', 10)) {
            date = new Date(utcString + 'Z'); // Add Z to indicate UTC
          } else {
            date = new Date(dateInput);
          }
        } else if (dateInput.includes('+05:30') || dateInput.includes('+0530')) {
          // Already in IST format
          date = new Date(dateInput);
        } else {
          // Try to parse as-is
          date = new Date(dateInput);
        }
      } else {
        date = new Date(dateInput);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput);
        return 'N/A';
      }
      
      // Format in IST timezone (Asia/Kolkata) with consistent format matching real time
      // Use en-IN locale for Indian date/time format
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting date:', dateInput, error);
      return 'N/A';
    }
  };

  const parseDateString = (dateString) => {
    if (!dateString) return null;
    try {
      // Backend sends UTC timestamps in ISO format
      if (typeof dateString === 'string') {
        // If has timezone info (Z or +00:00), parse as UTC
        if (dateString.includes('Z') || dateString.endsWith('+00:00')) {
          return new Date(dateString);
        }
        // If has IST timezone (+05:30), parse directly
        if (dateString.includes('+05:30') || dateString.includes('+0530')) {
          return new Date(dateString);
        }
        // No timezone - assume UTC (backend sends UTC timestamps)
        const match = dateString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?/);
        if (match) {
          // Parse as UTC by adding Z
          return new Date(dateString + (dateString.includes('+') || dateString.includes('Z') ? '' : 'Z'));
        }
      }
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  };

  const getDuration = (loginAt, lastSeenAt, expiresAt, isActive, sessionData = {}) => {
    if (!loginAt) return 'N/A';
    try {
      const login = parseDateString(loginAt);
      if (!login || isNaN(login.getTime())) {
        return 'N/A';
      }
      
      // For closed sessions terminated by admin, use terminated_at (close time)
      // For expired sessions, use expires_at or last_seen_at
      // For active sessions, use last_seen_at or current time
      let endTime;
      if (!isActive) {
        // Closed/expired session
        // If terminated by admin, use terminated_at (session close time)
        // Otherwise use expires_at (expiry time) or last_seen_at (last activity)
        // Check if terminated_by_admin is true - if so, use terminated_at
        const terminatedByAdmin = sessionData && (sessionData.terminated_by_admin === true || sessionData.terminated_by_admin === 1 || sessionData.terminated_by_admin === '1' || sessionData.terminated_by_admin === 'true');
        if (terminatedByAdmin && sessionData && sessionData.terminated_at) {
          // Manually closed session - use termination time
          endTime = parseDateString(sessionData.terminated_at);
          console.log(`[DEBUG] Duration for terminated session: using terminated_at=${sessionData.terminated_at}`);
        } else if (expiresAt) {
          // Expired session - use expiry time
        endTime = parseDateString(expiresAt);
      } else if (lastSeenAt) {
          // Fallback to last activity time
        endTime = parseDateString(lastSeenAt);
      } else {
          // No end time - use login time as fallback (duration = 0)
          endTime = login;
        }
      } else {
        // Active session - ALWAYS use current time for accurate duration calculation
        // Don't use lastSeenAt for active sessions as it might be stale
        endTime = new Date(); // Current time for active session
      }
      
      if (!endTime || isNaN(endTime.getTime())) {
        return 'N/A';
      }
      
      // CRITICAL: Ensure endTime is never before login time
      // If endTime < login, use login time instead (duration = 0)
      if (endTime < login) {
        console.warn(`[WARN] End time (${endTime}) is before login time (${login}) for session, using login time instead`);
        endTime = login;
      }
      
      const diffMs = endTime - login;
      if (diffMs < 0) {
        // Should never happen after the above check, but handle gracefully
        return '0m';
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
      if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
      if (diffMins > 0) return `${diffMins}m`;
      return 'Less than 1m';
    } catch (error) {
      console.error('Error calculating duration:', loginAt, lastSeenAt, expiresAt, error);
      return 'N/A';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseDateString(dateString);
      if (!date || isNaN(date.getTime())) {
        return 'N/A';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDate(dateString);
    } catch (error) {
      console.error('Error calculating time ago:', dateString, error);
      return 'N/A';
    }
  };

  const clearFilters = () => {
    setFilters({
      actor_type: '',
      session_type: '',
      is_active: '',
      user_id: ''
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  return (
    <div className={`page-container ${theme}`}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Sessions</h1>
          <p className="page-subtitle">Monitor and manage active login sessions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              backgroundColor: showFilters ? 'rgba(59, 130, 246, 0.15)' : undefined,
              border: showFilters ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              padding: '6px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: showFilters ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none',
              minHeight: '32px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!showFilters) e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (!showFilters) e.currentTarget.style.backgroundColor = undefined;
            }}
          >
            <FiFilter size={12} color={showFilters ? '#3b82f6' : '#6b7280'} /> 
            <span>Filters</span>
            {Object.values(filters).some(f => f !== '') && (
              <span style={{ 
                background: '#3b82f6', 
                color: 'white', 
                borderRadius: '12px', 
                padding: '2px 8px', 
                fontSize: '11px',
                fontWeight: '700',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {Object.values(filters).filter(f => f !== '').length}
              </span>
            )}
          </button>
          <button
            onClick={() => fetchSessions()}
            className="btn-secondary"
            disabled={refreshing}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              opacity: refreshing ? 0.6 : 1,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              padding: '6px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              fontWeight: '500',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s',
              backgroundColor: refreshing ? '#f3f4f6' : undefined,
              minHeight: '32px',
              boxSizing: 'border-box',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!refreshing) e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              if (!refreshing) e.currentTarget.style.backgroundColor = undefined;
            }}
          >
            <FiRefreshCw 
              size={12}
              color={refreshing ? '#3b82f6' : '#6b7280'}
              style={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                flexShrink: 0
              }} 
            /> 
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            fontSize: '12px',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '6px 10px',
            borderRadius: '5px',
            border: '1px solid #e5e7eb',
            backgroundColor: autoRefreshEnabled ? 'rgba(34, 197, 94, 0.05)' : undefined,
            transition: 'all 0.2s',
            fontWeight: '500',
            minHeight: '32px',
            boxSizing: 'border-box',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = autoRefreshEnabled ? 'rgba(34, 197, 94, 0.1)' : '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = autoRefreshEnabled ? 'rgba(34, 197, 94, 0.05)' : undefined}
          >
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              style={{ 
                cursor: 'pointer',
                width: '12px',
                height: '12px',
                accentColor: '#22c55e',
                flexShrink: 0
              }}
            />
            <span style={{ color: autoRefreshEnabled ? '#16a34a' : '#6b7280', whiteSpace: 'nowrap' }}>
              Auto-refresh (30s)
            </span>
          </label>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Filter Sessions</h3>
            <button onClick={clearFilters} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiX /> Clear
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>User Type</label>
              <select
                value={filters.actor_type}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, actor_type: e.target.value }));
                  setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when filter changes
                }}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Types</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="guest">Guest</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Session Type</label>
              <select
                value={filters.session_type}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, session_type: e.target.value }));
                  setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when filter changes
                }}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Sessions</option>
                <option value="admin">Admin Panel</option>
                <option value="site">Site</option>
                <option value="api">API</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Status</label>
              <select
                value={filters.is_active}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, is_active: e.target.value }));
                  setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when filter changes
                }}
                className="form-select"
                style={{ width: '100%' }}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>User ID</label>
              <input
                type="number"
                value={filters.user_id}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, user_id: e.target.value }));
                  setPagination(prev => ({ ...prev, offset: 0 })); // Reset to first page when filter changes
                }}
                placeholder="Filter by user ID"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)' }}>
              <FiActivity size={24} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total Sessions</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                {loading ? '...' : stats.total_sessions.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)' }}>
              <FiClock size={24} color="#22c55e" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Active Now</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                {loading ? '...' : stats.active_sessions}
              </h3>
              {!loading && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {stats.total_sessions - stats.active_sessions} inactive
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)' }}>
              <FiMonitor size={24} color="#a855f7" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Admin Sessions</p>
              <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                {loading ? '...' : stats.admin_sessions}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading && sessions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '20px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              marginBottom: '16px'
            }}>
              <FiRefreshCw size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>
              Loading sessions...
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '20px',
              borderRadius: '50%',
              background: 'rgba(107, 114, 128, 0.1)',
              marginBottom: '16px'
            }}>
              <FiAlertCircle size={32} color="#6b7280" />
            </div>
            <h3 style={{ margin: '8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
              No sessions found
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {Object.values(filters).some(f => f !== '') 
                ? 'Try adjusting your filters to see more results.'
                : 'No user sessions have been recorded yet.'}
            </p>
            {Object.values(filters).some(f => f !== '') && (
              <button
                onClick={clearFilters}
                className="btn-secondary"
                style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FiX /> Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {refreshing && (
              <div style={{ 
                padding: '6px 12px', 
                background: 'rgba(59, 130, 246, 0.05)', 
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                color: '#3b82f6'
              }}>
                <FiRefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                Refreshing...
              </div>
            )}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    borderBottom: '2px solid #e5e7eb',
                    background: '#f9fafb'
                  }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>ID</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>User</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Type</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Device</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>IP Address</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Login Time</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Last Seen</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Expires At</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Duration</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Status</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontSize: '9px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr 
                      key={session.id} 
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        background: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                    >
                      <td style={{ padding: '6px 8px', fontSize: '9px', fontWeight: '500', color: '#1e293b' }}>
                        #{session.id}
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ 
                            padding: '3px',
                            borderRadius: '4px',
                            background: session.actor_type === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'
                          }}>
                            <FiUser size={10} color={session.actor_type === 'admin' ? '#dc2626' : '#2563eb'} />
                          </div>
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>
                            {session.user_name || (session.user_id ? `User ID: ${session.user_id}` : 'Guest Session')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '8px',
                            fontWeight: '600',
                            background: session.actor_type === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: session.actor_type === 'admin' ? '#dc2626' : '#2563eb',
                            display: 'inline-block',
                            width: 'fit-content',
                            textTransform: 'capitalize'
                          }}>
                            {session.actor_type || 'customer'}
                          </span>
                          <span style={{
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontSize: '7px',
                            fontWeight: '500',
                            background: 'rgba(107, 114, 128, 0.1)',
                            color: '#6b7280',
                            display: 'inline-block',
                            width: 'fit-content',
                            textTransform: 'capitalize'
                          }}>
                            {session.session_type || 'site'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiMonitor size={10} color="#6b7280" />
                            <span style={{ fontWeight: '500', color: '#1e293b' }}>{session.device_type || 'Unknown'}</span>
                          </div>
                          <span style={{ fontSize: '8px', color: '#6b7280' }}>
                            {session.browser || 'Unknown'} • {session.os || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiMapPin size={10} color="#6b7280" />
                          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#1e293b' }}>
                            {session.ip_address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ color: '#1e293b' }}>
                            {formatDate(session.login_at || session.entry_time || session.created_at)}
                          </span>
                          {(session.login_at || session.entry_time || session.created_at) && (
                            <span style={{ fontSize: '8px', color: '#9ca3af' }}>
                              {getTimeAgo(session.login_at || session.entry_time || session.created_at)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ color: '#1e293b' }}>
                            {/* Always use last_seen_at (aliased from last_activity) - but ensure it's not before login time */}
                            {(() => {
                              const loginTime = parseDateString(session.login_at || session.entry_time || session.created_at);
                              const lastSeenTime = parseDateString(session.last_seen_at || session.last_activity || session.updated_at);
                              // If last_seen is before login (data issue), use login time as last_seen
                              const displayTime = (lastSeenTime && loginTime && lastSeenTime < loginTime) 
                                ? (session.login_at || session.entry_time || session.created_at)
                                : (session.last_seen_at || session.last_activity || session.updated_at);
                              return formatDate(displayTime);
                            })()}
                          </span>
                          {(() => {
                            const loginTime = parseDateString(session.login_at || session.entry_time || session.created_at);
                            const lastSeenTime = parseDateString(session.last_seen_at || session.last_activity || session.updated_at);
                            const displayTime = (lastSeenTime && loginTime && lastSeenTime < loginTime) 
                              ? (session.login_at || session.entry_time || session.created_at)
                              : (session.last_seen_at || session.last_activity || session.updated_at);
                            return displayTime && (
                            <span style={{ fontSize: '8px', color: '#9ca3af' }}>
                                {getTimeAgo(displayTime)}
                            </span>
                            );
                          })()}
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        {(() => {
                          // Calculate expiration: 30 minutes from last_activity (inactivity-based)
                          // CRITICAL: Always calculate from last_seen_at/last_activity, not from backend expires_at
                          // When user is active, last_activity updates → expiration extends automatically
                          const lastSeen = session.last_seen_at || session.last_activity || session.updated_at;
                          if (!lastSeen) {
                            return <span style={{ color: '#9ca3af', fontSize: '9px' }}>N/A</span>;
                          }
                          
                          const lastSeenDate = parseDateString(lastSeen);
                          if (!lastSeenDate || isNaN(lastSeenDate.getTime())) {
                            return <span style={{ color: '#9ca3af', fontSize: '9px' }}>N/A</span>;
                          }
                          
                          // For terminated sessions, use terminated_at as expiration time
                          // For active/expired sessions, calculate: last_activity + 30 minutes
                          let expiresDate;
                          if (session.terminated_by_admin && session.terminated_at) {
                            expiresDate = parseDateString(session.terminated_at);
                            if (!expiresDate || isNaN(expiresDate.getTime())) {
                              // Fallback to calculation if terminated_at parsing fails
                              expiresDate = new Date(lastSeenDate.getTime() + 30 * 60 * 1000);
                            }
                          } else {
                            // Calculate expiration time: 30 minutes from last activity (inactivity-based)
                            expiresDate = new Date(lastSeenDate.getTime() + 30 * 60 * 1000);
                          }
                          
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <span style={{ 
                                color: session.is_active ? '#1e293b' : '#dc2626',
                                fontWeight: session.is_active ? '400' : '500'
                              }}>
                                {formatDate(expiresDate)}
                              </span>
                              <span style={{ 
                                fontSize: '8px', 
                                color: session.is_active ? '#9ca3af' : '#dc2626',
                                fontWeight: session.is_active ? '400' : '500'
                              }}>
                                {(() => {
                                  if (!session.is_active) {
                                    // Closed session
                                    const now = new Date();
                                    const diffMs = now - expiresDate;
                                    const diffMins = Math.floor(diffMs / 60000);
                                    
                                    if (diffMins < 1) return 'Closed just now';
                                    if (diffMins < 60) return `Closed ${diffMins}m ago`;
                                    const diffHours = Math.floor(diffMins / 60);
                                    if (diffHours < 24) return `Closed ${diffHours}h ago`;
                                    const diffDays = Math.floor(diffHours / 24);
                                    return `Closed ${diffDays}d ago`;
                                  }
                                  
                                  // Active session - show time until expiration
                                  const now = new Date();
                                  const diffMs = expiresDate - now;
                                  const diffMins = Math.floor(diffMs / 60000);
                                  if (diffMins < 0) return 'Expired';
                                  if (diffMins < 60) return `Expires in ${diffMins}m`;
                                  const diffHours = Math.floor(diffMins / 60);
                                  if (diffHours < 24) return `Expires in ${diffHours}h`;
                                  const diffDays = Math.floor(diffHours / 24);
                                  return `Expires in ${diffDays}d`;
                                })()}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock size={10} color="#6b7280" />
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>
                            {getDuration(
                              session.login_at || session.entry_time || session.created_at,
                              session.last_seen_at || session.last_activity || session.updated_at,
                              session.expires_at,
                              session.is_active === true || session.is_active === 1 || session.is_active === '1' || session.is_active === 'true',
                              session // Pass full session object for terminated_at access
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '8px',
                          fontWeight: '600',
                          background: session.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: session.is_active ? '#16a34a' : '#6b7280',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {session.is_active ? (
                            <>
                              <FiCheckCircle size={8} />
                              Active
                            </>
                          ) : session.terminated_by_admin ? (
                            <>
                              <FiX size={8} />
                              Terminated by Admin
                            </>
                          ) : (
                            <>
                              <FiX size={8} />
                              Closed
                            </>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', fontSize: '9px' }}>
                        {session.is_active && (
                          <button
                            onClick={() => handleCloseSession(session.id)}
                            className="btn-danger"
                            style={{ 
                              padding: '3px 8px', 
                              fontSize: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontWeight: '500',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <FiLogOut size={10} /> Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 0 && pagination.total > pagination.limit && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '8px 12px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total || 0)} of {(pagination.total || 0).toLocaleString()} sessions
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                    disabled={pagination.offset === 0}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '10px' }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                    disabled={pagination.offset + pagination.limit >= (pagination.total || 0)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '10px' }}
                  >
                    Next
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

export default UserSessions;

