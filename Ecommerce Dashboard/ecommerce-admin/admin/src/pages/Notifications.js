import React, { useState, useEffect } from 'react';
import { 
  FiBell, 
  FiCheck, 
  FiX, 
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiClock,
  FiAlertCircle,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
  FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import TimeAgo from '../components/TimeAgo.jsx';
import apiClient from '../services/apiClient';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 5 seconds for more responsive updates
    // TimeAgo component handles real-time time updates automatically
    const refreshInterval = setInterval(fetchNotifications, 5000);
    
    // Listen for immediate refresh events
    const handleRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('refreshNotifications', handleRefresh);
    
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/admin/notifications', { 
        params: { limit: 100 },
        suppressErrorToast: true // Suppress error toast for background refresh
      });
      
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.notification_type || n.type,
          unread: !n.is_read,
          priority: n.priority || 'medium',
          created_at: n.created_at
        })));
      } else {
        setNotifications([]);
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Only show error toast if it's not a 401 (handled by apiClient)
      if (error.response?.status !== 401) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(notification => notification.type === filter);
    }

    // Filter by search term - empty search shows all
    if (searchTerm && searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search)
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, unread: false }
            : notification
        )
      );

      await apiClient.put(`/admin/notifications/${notificationId}/read`, {});
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, unread: false }))
      );

      await apiClient.put('/admin/notifications/read-all', {});
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Update local state immediately
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );

      await apiClient.delete(`/admin/notifications/${notificationId}`);
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiShoppingCart className="text-blue-500" />;
      case 'payment':
        return <FiDollarSign className="text-green-500" />;
      case 'stock':
        return <FiPackage className="text-orange-500" />;
      case 'customer':
        return <FiUsers className="text-purple-500" />;
      case 'system':
        return <FiAlertCircle className="text-red-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return (
      <div className="flex items-center justify-center" style={{ height: '300px' }}>
        <div style={{
          textAlign: 'center',
          color: isDark ? '#94a3b8' : '#64748b'
        }}>
          <div className="loading" style={{ fontSize: '10px' }}>Loading notifications...</div>
        </div>
      </div>
    );
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '14px', marginBottom: '2px', lineHeight: '1.3', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Notifications
          </h1>
          <p className="page-subtitle" style={{ fontSize: '9px', margin: 0, lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#64748b' }}>
            Manage and view all system notifications
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={fetchNotifications}
              disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              fontWeight: '500',
              fontSize: '9px',
              minHeight: '24px',
              background: isDark ? '#334155' : '#f8fafc',
              border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
              borderRadius: '6px',
              color: isDark ? '#cbd5e1' : '#475569',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#475569' : '#f1f5f9';
              e.currentTarget.style.borderColor = isDark ? '#64748b' : '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
              e.currentTarget.style.borderColor = isDark ? '#475569' : '#e2e8f0';
            }}
            >
            <FiRefreshCw style={{ fontSize: '10px' }} /> Refresh
            </button>
            <button 
              className="btn btn-primary"
              onClick={markAllAsRead}
              disabled={notifications.filter(n => n.unread).length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              fontWeight: '600',
              fontSize: '9px',
              background: 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)',
              color: 'white',
              border: 'none',
              minHeight: '24px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff9500 0%, #ffa500 100%)';
                e.currentTarget.style.boxShadow = '0 3px 6px rgba(255, 140, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 0, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
            <FiCheck style={{ fontSize: '10px' }} /> Mark All Read
            </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        background: isDark ? '#1e293b' : 'white',
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '10px',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <FiSearch style={{ 
                position: 'absolute', 
              left: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '12px'
              }} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                padding: '6px 10px 6px 32px',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '9px',
                background: isDark ? '#0f172a' : 'white',
                color: isDark ? '#e2e8f0' : '#1e293b',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #FF8C00';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = `1px solid ${isDark ? '#334155' : '#e2e8f0'}`;
                e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-select"
            style={{
              width: '140px',
              padding: '6px 10px',
              border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
              borderRadius: '6px',
              fontSize: '9px',
              background: isDark ? '#0f172a' : 'white',
              color: isDark ? '#e2e8f0' : '#1e293b',
              minHeight: '26px'
            }}
            >
              <option value="all">All Types</option>
              <option value="order">Orders</option>
              <option value="payment">Payments</option>
              <option value="stock">Stock</option>
              <option value="customer">Customers</option>
              <option value="system">System</option>
            </select>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        background: isDark ? '#1e293b' : 'white',
        borderRadius: '8px',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '8px 10px',
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '10px',
            fontWeight: '600',
            color: isDark ? '#e2e8f0' : '#1e293b'
          }}>
            {filteredNotifications.length} Notification{filteredNotifications.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` (${filter})`}
          </h3>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
            <FiBell style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3, color: isDark ? '#475569' : '#94a3b8' }} />
            <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#475569' }}>No notifications found</p>
            <p style={{ fontSize: '8px', lineHeight: '1.3', color: isDark ? '#94a3b8' : '#64748b' }}>No notifications match your search criteria.</p>
          </div>
        ) : (
          <div style={{ padding: '0' }}>
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '10px 12px',
                  borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                  borderLeft: `3px solid ${notification.unread ? '#FF8C00' : 'transparent'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  background: notification.unread ? (isDark ? 'rgba(255, 184, 0, 0.1)' : '#f0f9ff') : (isDark ? '#1e293b' : 'white'),
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = notification.unread ? (isDark ? 'rgba(255, 184, 0, 0.1)' : '#f0f9ff') : (isDark ? '#1e293b' : 'white');
                }}
              >
                <div style={{ marginTop: '2px', fontSize: '14px' }}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3' }}>
                      {notification.title}
                    </h4>
                      {notification.unread && (
                        <div style={{
                        width: '6px',
                        height: '6px',
                          borderRadius: '50%',
                        background: '#FFB800',
                        marginTop: '4px',
                        flexShrink: 0
                        }} />
                      )}
                  </div>
                  
                  <p style={{ margin: '0 0 6px 0', fontSize: '8px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: '1.3' }}>
                    {notification.message}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '7px', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock style={{ fontSize: '8px' }} />
                      <TimeAgo dateString={notification.created_at} />
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      disabled={!notification.unread}
                        style={{
                          padding: '3px 8px',
                          fontSize: '8px',
                          fontWeight: '500',
                          background: notification.unread ? (isDark ? '#334155' : '#f8fafc') : 'transparent',
                          border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                          borderRadius: '4px',
                          color: isDark ? '#cbd5e1' : '#475569',
                          cursor: notification.unread ? 'pointer' : 'not-allowed',
                          opacity: notification.unread ? 1 : 0.5,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        onMouseEnter={(e) => {
                          if (notification.unread) {
                            e.currentTarget.style.background = isDark ? '#475569' : '#f1f5f9';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (notification.unread) {
                            e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                          }
                        }}
                      >
                        <FiCheck style={{ fontSize: '8px' }} /> Read
                    </button>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{
                          padding: '3px 8px',
                          fontSize: '8px',
                          fontWeight: '500',
                          background: isDark ? '#334155' : '#f8fafc',
                          border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                          borderRadius: '4px',
                          color: isDark ? '#cbd5e1' : '#475569',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                          e.currentTarget.style.borderColor = '#fca5a5';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                          e.currentTarget.style.borderColor = isDark ? '#475569' : '#e2e8f0';
                          e.currentTarget.style.color = isDark ? '#cbd5e1' : '#475569';
                        }}
                    >
                        <FiTrash2 style={{ fontSize: '8px' }} /> Delete
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
