import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiBarChart2,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiUsers,
  FiAward,
  FiFileText,
  FiCreditCard,
  FiDollarSign,
  FiSettings,
  FiBell,
  FiMenu,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import CurrencySwitcher from './CurrencySwitcher.jsx';
import TimeAgo from './TimeAgo.jsx';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const collapsedMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const [collapsedSubmenu, setCollapsedSubmenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const pollingRef = useRef(false);

  // Fetch notifications from backend
  useEffect(() => {
    if (user) {
      fetchNotifications(true); // Initial load with loading indicator
      // Poll for new notifications every 30 seconds (reduced frequency to avoid flickering)
      const notificationInterval = setInterval(() => {
        fetchNotifications(false); // Polling without loading indicator
      }, 30000);
      
      return () => {
        clearInterval(notificationInterval);
      };
    }
  }, [user]);

  // Listen for custom events to refresh notifications immediately after actions
  useEffect(() => {
    const handleNotificationRefresh = () => {
      console.log('[NOTIFICATIONS] Event received, refreshing notifications...');
      // Add a small delay to ensure backend has processed the action
      setTimeout(() => {
        fetchNotifications(false); // Silent refresh without loading indicator
      }, 500);
    };

    // Listen for product operations and other actions
    window.addEventListener('productCreated', handleNotificationRefresh);
    window.addEventListener('productDeleted', handleNotificationRefresh);
    window.addEventListener('productUpdated', handleNotificationRefresh);
    window.addEventListener('refreshNotifications', handleNotificationRefresh);

    return () => {
      window.removeEventListener('productCreated', handleNotificationRefresh);
      window.removeEventListener('productDeleted', handleNotificationRefresh);
      window.removeEventListener('productUpdated', handleNotificationRefresh);
      window.removeEventListener('refreshNotifications', handleNotificationRefresh);
    };
  }, []);

  const fetchNotifications = async (showLoading = false) => {
    if (!user) return;
    
    // Prevent concurrent fetches
    if (pollingRef.current) return;
    pollingRef.current = true;
    
    try {
      if (showLoading) {
        setLoadingNotifications(true);
      }
      const response = await apiClient.get('/admin/notifications?limit=20');
      if (response.data) {
        const notifications = response.data.notifications || [];
        const unread = response.data.unread_count || 0;
        console.log(`[NOTIFICATIONS] Fetched ${notifications.length} notifications, ${unread} unread`);
        if (notifications.length > 0) {
          console.log('[NOTIFICATIONS] Latest notifications:', notifications.slice(0, 3).map(n => ({ id: n.id, title: n.title, type: n.notification_type })));
        }
        setNotifications(notifications);
        setUnreadCount(unread);
      }
    } catch (error) {
      // Only log error if it's not an auth issue (401 is handled by apiClient)
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoadingNotifications(false);
      pollingRef.current = false;
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await apiClient.put(`/admin/notifications/${notificationId}/read`);
      fetchNotifications(false); // Silent refresh without loading indicator
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.put('/admin/notifications/read-all');
      fetchNotifications(false); // Silent refresh without loading indicator
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
    }
    // You can add navigation logic here based on notification type
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => {
      const newState = {
        ...prev,
        [menuName]: !prev[menuName]
      };
      
      // If opening a submenu, ensure Settings remains accessible by scrolling if needed
      if (newState[menuName] && !sidebarCollapsed) {
        setTimeout(() => {
          const navMenu = document.querySelector('.nav-menu');
          const settingsItem = Array.from(document.querySelectorAll('.nav-item-root')).find(
            el => el.textContent?.includes('Settings')
          );
          
          if (navMenu && settingsItem) {
            const navMenuRect = navMenu.getBoundingClientRect();
            const settingsRect = settingsItem.getBoundingClientRect();
            
            // If Settings is below visible area, scroll to show it
            if (settingsRect.bottom > navMenuRect.bottom) {
              settingsItem.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
          }
        }, 100);
      }
      
      return newState;
    });
  };

  const allNavigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
    { name: 'Orders', href: '/orders', icon: FiShoppingCart },
    { 
      name: 'Products', 
      href: '/products', 
      icon: FiPackage,
      children: [
        { name: 'All Products', href: '/products' },
        { name: 'Add Product', href: '/products/add' },
        { name: 'Categories', href: '/products/categories' },
        { name: 'Product Packs', href: '/products/packs' },
        { name: 'Sizes', href: '/products/sizes' },
        { name: 'Health Benefits', href: '/health-benefits' }
      ]
    },
    { name: 'Customers', href: '/users', icon: FiUsers },
    ...(user?.is_super_admin ? [
      { name: 'User Sessions', href: '/sessions', icon: FiActivity },
      { name: 'Activity Log', href: '/activity-log', icon: FiFileText }
    ] : []),
    ...(user?.is_super_admin ? [{ name: 'Tenant Management', href: '/tenants', icon: FiUsers }] : []),
    ...(user?.is_tenant_admin ? [{ name: 'Role Management', href: '/role-management', icon: FiShield }] : []),
    { 
      name: 'Coupons', 
      href: '/coupons', 
      icon: FiTag,
      children: [
        { name: 'All Coupons', href: '/coupons' },
        { name: 'Add Coupon', href: '/coupons/add' }
      ]
    },
    { 
      name: 'Reports', 
      href: '/revenue/reports', 
      icon: FiFileText,
      children: [
        { name: 'Revenue Reports', href: '/revenue/reports' },
        { name: 'Revenue Analytics', href: '/revenue/analytics' },
        { name: 'Revenue Settings', href: '/revenue/settings' }
      ]
    },
    { 
      name: 'Rewards Program', 
      href: '/rewards', 
      icon: FiAward
    },
    { 
      name: 'Pricing & Currency', 
      href: '/currency-management', 
      icon: FiDollarSign,
      children: [
        { name: 'Tax Management', href: '/tax-management' },
        { name: 'Currency Management', href: '/currency-management' },
        { name: 'Enterprise Pricing', href: '/enterprise-pricing' }
      ]
    },
    { name: 'Invoices', href: '/invoices', icon: FiFileText },
    { name: 'Payment', href: '/payment', icon: FiCreditCard },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: FiSettings,
      children: [
        { name: 'General Settings', href: '/settings' }
      ]
    },
  ];

  // No RBAC filtering for now – show all navigation items
  const navigation = allNavigationItems;

  const isActive = (href, exactMatch = false) => {
    const path = location.pathname;
    const normalizedPath = path.replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    
    if (normalizedPath === normalizedHref) return true;
    if (normalizedHref === '/dashboard' && (normalizedPath === '/' || normalizedPath === '/dashboard')) return true;
    if (!exactMatch && normalizedPath.startsWith(normalizedHref + '/')) return true;
    return false;
  };

  useEffect(() => {
    navigation.forEach(item => {
      if (item.children?.some(child => isActive(child.href, true))) {
        setExpandedMenus(prev => (prev[item.name] ? prev : { ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarCollapsed) {
      setCollapsedSubmenu(null);
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!sidebarCollapsed) {
      setCollapsedSubmenu(null);
      return;
    }

    const handleClickOutside = (event) => {
      const clickedSidebar = sidebarRef.current?.contains(event.target);
      const clickedPopup = collapsedMenuRef.current?.contains(event.target);
      if (!clickedSidebar && !clickedPopup) {
        setCollapsedSubmenu(null);
      }
    };

    const handleScroll = () => setCollapsedSubmenu(null);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [collapsedSubmenu, sidebarCollapsed]);

  const handleNavClick = (item, hasChildren, event) => {
    if (sidebarCollapsed && hasChildren) {
      event.preventDefault();
      const isSameItemOpen = collapsedSubmenu?.itemName === item.name;

      if (isSameItemOpen) {
        if (item.href) {
          navigate(item.href);
        } else if (item.children[0]?.href) {
          navigate(item.children[0].href);
        }
        setCollapsedSubmenu(null);
        return;
      }

      const triggerRect = event.currentTarget.getBoundingClientRect();
      const sidebarRect = sidebarRef.current?.getBoundingClientRect();
      const popupLeft = sidebarRect ? sidebarRect.right + 8 : triggerRect.right + 8;
      const estimatedHeight = (item.children?.length || 0) * 36 + 40;
      const maxTop = Math.max(12, window.innerHeight - estimatedHeight);
      const popupTop = Math.min(triggerRect.top, maxTop);

      setCollapsedSubmenu({
        itemName: item.name,
        children: item.children || [],
        top: popupTop,
        left: popupLeft,
      });
      return;
    }

    if (item.href) {
      navigate(item.href);
    } else if (hasChildren && item.children[0]?.href) {
      navigate(item.children[0].href);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 48 : 170; /* 67% zoom: 72*0.67=48px, 250*0.67=167.5px rounded to 170px */

  return (
    <div className="layout">
      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{ display: 'block', visibility: 'visible', width: `${sidebarWidth}px` }}
        ref={sidebarRef}
      >
        <div className="sidebar-header" style={{ 
          display: 'flex', 
          justifyContent: sidebarCollapsed ? 'center' : 'space-between', 
          alignItems: 'center', 
          gap: '6px',
          position: 'relative',
          paddingRight: sidebarCollapsed ? '6px' : '8px'
        }}>
          {!sidebarCollapsed && (
            <div className="logo">
              <div className="logo-icon">
                <FiPackage />
              </div>
              <span>Peenakaa</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="logo" style={{ justifyContent: 'center' }}>
              <div className="logo-icon">
                <FiPackage />
              </div>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarCollapsed(prev => !prev);
            }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              position: sidebarCollapsed ? 'absolute' : 'relative',
              right: sidebarCollapsed ? '5px' : '0', /* 67% zoom: 8px * 0.67 = 5px */
              top: sidebarCollapsed ? '50%' : 'auto',
              transform: sidebarCollapsed ? 'translateY(-50%)' : 'none',
              zIndex: 1001,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px', /* 67% zoom: 6px * 0.67 = 4px */
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '24px', /* Minimum touch target */
              minHeight: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav 
          className="nav-menu" 
          id="nav-menu"
          style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden',
            flex: 1,
            maxHeight: 'calc(100vh - 60px)', /* Account for header + padding */
            paddingBottom: '8px',
            scrollBehavior: 'smooth'
          }}
        >
          {navigation.map((item) => {
            const hasChildren = item.children?.length > 0;
            const isExpanded = expandedMenus[item.name];
            const rootActive = item.children
              ? item.children.some(child => isActive(child.href, true))
              : isActive(item.href);

            return (
              <div 
                key={item.name} 
                className="nav-item"
              >
                <button
                  className={`nav-item-root ${rootActive ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(item, hasChildren, e)}
                  type="button"
                  aria-haspopup={hasChildren ? 'true' : 'false'}
                  aria-expanded={!sidebarCollapsed && hasChildren ? !!isExpanded : undefined}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <item.icon className="nav-item-icon" />
                  {!sidebarCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {hasChildren && (
                        <span
                          className={`nav-item-arrow ${isExpanded ? 'expanded' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubmenu(item.name);
                          }}
                        >
                          <FiChevronRight />
                        </span>
                      )}
                    </>
                  )}
                </button>

                {hasChildren && !sidebarCollapsed && (
                  <div className={`nav-submenu ${isExpanded ? 'open' : ''}`}>
                    {item.children.map(child => {
                      const childActive = isActive(child.href, true);
                      return (
                        <button
                          key={child.name}
                          className={`nav-submenu-item ${childActive ? 'active' : ''}`}
                          onClick={() => navigate(child.href)}
                        >
                          <span className="nav-submenu-dot" />
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        {sidebarCollapsed && collapsedSubmenu && (
          <div 
            className="collapsed-submenu-popup"
            ref={collapsedMenuRef}
            style={{ 
              top: collapsedSubmenu.top,
              left: collapsedSubmenu.left
            }}
          >
            <div className="collapsed-submenu-title">{collapsedSubmenu.itemName}</div>
            {collapsedSubmenu.children.map(child => (
              <button
                key={child.name}
                className="collapsed-submenu-item"
                onClick={() => {
                  navigate(child.href);
                  setCollapsedSubmenu(null);
                }}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className="main-content"
        style={{
          marginLeft: `${sidebarWidth}px`,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div>
              <h1 style={{ margin: 0, fontSize: '7px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Welcome Back {user?.full_name || user?.username || 'System Administrator'}
              </h1>
            </div>

            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }}
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          <div className="header-right">
            <div className="header-actions">
              {/* Currency Switcher */}
              <CurrencySwitcher />

              {/* Quick Login (switch account) */}
              <button
                className="login-nav-btn"
                onClick={() => logout()}
                title="Go back to login screen"
              >
                Login
              </button>

              {/* Notifications */}
              <div className="notification-container" ref={notificationRef}>
                <button 
                  className="notification-btn"
                  onClick={() => {
                    if (!notificationsOpen) {
                      fetchNotifications(true); // Fetch with loading when opening
                    }
                    setNotificationsOpen(!notificationsOpen);
                  }}
                >
                  <FiBell />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {notificationsOpen && (
                  <div className="notification-dropdown">
                    {loadingNotifications ? (
                      <div className="notification-item">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-item">No notifications</div>
                    ) : (
                      <>
                        <div className="notification-header">
                          <h3>Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              className="btn-link"
                              onClick={markAllRead}
                              style={{ fontSize: '8px', padding: '2px 6px', fontWeight: '500', color: '#FF8C00' }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="notification-list">
                          {notifications.map(n => {
                            // Clean up title - remove confusing "Test - X Minutes Ago" patterns
                            let displayTitle = n.title;
                            if (displayTitle && displayTitle.startsWith('Test - ')) {
                              // For test notifications, use a cleaner title
                              displayTitle = displayTitle.replace(/^Test - /, '');
                            }
                            
                            return (
                              <div 
                                key={n.id}
                                className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(n)}
                              >
                                <div style={{ paddingRight: '16px' }}>
                                  <h4>{displayTitle}</h4>
                                  <p>{n.message}</p>
                                  <TimeAgo dateString={n.created_at} />
                                </div>
                                {!n.is_read && <div className="unread-dot"></div>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        <main className="content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 20px', width: '100%', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
