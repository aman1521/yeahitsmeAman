import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiSave,
  FiEdit3,
  FiCamera,
  FiShield,
  FiActivity,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiX,
  FiLogOut,
  FiCheck,
  FiAlertCircle,
  FiGlobe,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    email: '',
    full_name: '',
    role: '',
    last_login: '',
    password_last_changed: '',
    profile_last_updated: '',
    created_at: '',
    active_sessions: 0
  });
  const [statistics, setStatistics] = useState({
    total_orders: 0,
    recent_orders: 0,
    total_products: 0,
    active_products: 0,
    total_customers: 0,
    active_customers: 0,
    total_revenue: 0,
    recent_revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [revokingSession, setRevokingSession] = useState(null);

  useEffect(() => {
    fetchProfileData();
    // Auto-refresh profile data every 30 seconds to get updated timestamps
    const interval = setInterval(() => {
      fetchProfileData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await apiClient.get('/api/admin/profile');
      if (response.data.success && response.data.profile) {
        const profile = response.data.profile;
        setProfileData({
          email: profile.email || '',
          full_name: profile.full_name || '',
          role: profile.role || 'admin',
          last_login: profile.last_login || '',
          password_last_changed: profile.password_last_changed || '',
          profile_last_updated: profile.profile_last_updated || '',
          created_at: profile.created_at || '',
          active_sessions: profile.active_sessions || 0
        });
        setStatistics(profile.statistics || {});
        setRecentActivity(profile.recent_activity || []);
        setActiveSessions(profile.active_sessions_list || []);
        setLoginHistory(profile.login_history || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    if (user) {
      setProfileData({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role || 'admin',
        last_login: user.last_login || '',
          password_last_changed: '',
          profile_last_updated: '',
          created_at: user.created_at || '',
          active_sessions: 0
      });
    }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile({
        email: profileData.email,
        full_name: profileData.full_name
      });
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        await fetchProfileData();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfileData(); // Reset to original values
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session? You will be logged out from that device.')) {
      return;
    }
    
    setRevokingSession(sessionId);
    try {
      const response = await apiClient.post(`/api/admin/sessions/${sessionId}/revoke`);
      if (response.data.success) {
        toast.success('Session revoked successfully');
        await fetchProfileData();
      } else {
        toast.error(response.data.message || 'Failed to revoke session');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs} second${diffSecs > 1 ? 's' : ''} ago`;
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e, dateString);
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDeviceIcon = (deviceType) => {
    if (deviceType?.toLowerCase().includes('mobile')) return <FiSmartphone />;
    if (deviceType?.toLowerCase().includes('tablet')) return <FiTablet />;
    return <FiMonitor />;
  };

  const getActionIcon = (actionType) => {
    if (actionType.includes('LOGIN')) return <FiLogOut style={{ transform: 'rotate(180deg)' }} />;
    if (actionType.includes('PASSWORD')) return <FiShield />;
    if (actionType.includes('PROFILE')) return <FiUser />;
    if (actionType.includes('SESSION')) return <FiActivity />;
    return <FiActivity />;
  };

  if (profileLoading) {
  return (
    <div className="page-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Orders</div>
            <FiShoppingCart style={{ fontSize: '20px', color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {statistics.total_orders || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            {statistics.recent_orders || 0} in last 30 days
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Total Revenue</div>
            <FiDollarSign style={{ fontSize: '20px', color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {formatCurrency(statistics.total_revenue || 0)}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            {formatCurrency(statistics.recent_revenue || 0)} in last 30 days
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Products</div>
            <FiPackage style={{ fontSize: '20px', color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {statistics.total_products || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            {statistics.active_products || 0} active
          </div>
      </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Customers</div>
            <FiUsers style={{ fontSize: '20px', color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {statistics.total_customers || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>
            {statistics.active_customers || 0} active
          </div>
        </div>
          </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {/* Profile Picture */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '48px',
              color: 'white',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <FiUser />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
                cursor: 'pointer'
              }}>
                <FiCamera style={{ fontSize: '16px', color: 'white' }} />
              </div>
            </div>

            <h3 style={{ marginBottom: '8px', color: '#1e293b', fontSize: '20px', fontWeight: '600' }}>
              {profileData.full_name || 'System Administrator'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
              {profileData.email || 'admin@ecommerce.com'}
            </p>

            {/* Role Badge */}
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#f0f9ff',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
                  {profileData.role?.toUpperCase() || 'ADMIN'}
                </div>
              </div>

          {/* Quick Stats */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Member Since</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
              </span>
                </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Last Login</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {profileData.last_login ? formatTimeAgo(profileData.last_login) : 'Never'}
              </span>
              </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Active Sessions</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {profileData.active_sessions || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Information */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                  Profile Information
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px' }}>Update your personal information</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <FiEdit3 />
                  Edit Profile
                </button>
              )}
          </div>

          <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: isEditing ? 'white' : '#f8fafc',
                      color: isEditing ? '#1e293b' : '#64748b'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: isEditing ? 'white' : '#f8fafc',
                      color: isEditing ? '#1e293b' : '#64748b'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={profileData.role || 'admin'}
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: '#f8fafc',
                      color: '#64748b'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    Account Status
                  </label>
                  <input
                    type="text"
                    value="Active"
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: '#f0fdf4',
                      color: '#10b981',
                      fontWeight: '600'
                    }}
                  />
              </div>
            </div>

            {isEditing && (
              <div style={{
                  paddingTop: '24px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                  gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleCancel}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      background: loading ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                >
                  <FiSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

          {/* Security & Sessions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Security */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FiShield style={{ fontSize: '20px', color: '#3b82f6' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Security</h3>
      </div>

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>Password</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {profileData.password_last_changed 
                        ? `Last changed ${formatTimeAgo(profileData.password_last_changed)}`
                        : 'Never changed'}
          </div>
              </div>
                  <button 
                    onClick={() => window.location.href = '/settings?tab=password'}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px'
                    }}
                  >
                    Change
              </button>
            </div>
              </div>

              <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>Two-Factor Authentication</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Not enabled</div>
              </div>
                  <button style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}>
                    Enable
              </button>
            </div>
          </div>
        </div>

            {/* Active Sessions */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FiMonitor style={{ fontSize: '20px', color: '#3b82f6' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Active Sessions</h3>
          </div>
              
              {activeSessions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeSessions.map((session) => (
                    <div key={session.id} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getDeviceIcon(session.device_type)}
              <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                              {session.device_type || 'Desktop'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {session.browser} • {session.os}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingSession === session.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #fee2e2',
                            background: 'white',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {revokingSession === session.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        <div>IP: {session.ip_address}</div>
                        <div>Last active: {formatTimeAgo(session.last_activity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No active sessions
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Login History */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FiActivity style={{ fontSize: '20px', color: '#3b82f6' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Recent Activity</h3>
              </div>
              
              {recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentActivity.map((activity, idx) => (
                    <div key={activity.id || idx} style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '12px',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#3b82f6',
                        flexShrink: 0
                      }}>
                        {getActionIcon(activity.action_type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                          {activity.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                        {activity.ip_address && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            IP: {activity.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No recent activity
                </div>
              )}
            </div>

            {/* Login History */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <FiClock style={{ fontSize: '20px', color: '#3b82f6' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Login History</h3>
              </div>
              
              {loginHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loginHistory.map((login) => (
                    <div key={login.id} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FiCheck style={{ fontSize: '16px', color: '#10b981' }} />
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                          Successful Login
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginLeft: '24px' }}>
                        <div>{formatTimeAgo(login.timestamp)}</div>
                        {login.ip_address && <div>IP: {login.ip_address}</div>}
                      </div>
              </div>
                  ))}
            </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No login history
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
