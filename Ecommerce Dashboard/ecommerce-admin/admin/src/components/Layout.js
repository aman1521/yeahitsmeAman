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
  FiActivity,
  FiGlobe,
  FiShoppingBag,
  FiLock,
  FiEye
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import CurrencySwitcher from './CurrencySwitcher.jsx';
import TimeAgo from './TimeAgo.jsx';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout, isDemoMode, isPersonalAdmin, switchToDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActuallyPersonalAdmin = Boolean(isPersonalAdmin || (!isDemoMode && user && (user.email === 'amanchouhan1217@gmail.com' || user.username === 'amanchouhan1217@gmail.com')));

  const handleSwitchToDemo = () => {
    if (switchToDemo) switchToDemo();
    navigate('/dashboard');
  };

  const handleAdminLogin = () => {
    logout();
    navigate('/login');
  };
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

  const portfolioAdminNavItems = [
    { name: 'Website Traffic (GA4)', href: '/portfolio-traffic', icon: FiGlobe },
    { name: 'Client Inquiries & Leads', href: '/users', icon: FiUsers },
    { name: 'Growth Intelligence (AI)', href: '/growth-ai', icon: FiActivity },
    { name: 'Portfolio Settings', href: '/settings', icon: FiSettings }
  ];

  const ecommerceDemoNavItems = [
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

  // Strictly guard: Only authenticated personal admin (Aman) sees portfolio items.
  // All demo users strictly see Ecommerce Store Demo items!
  const navigation = isActuallyPersonalAdmin ? portfolioAdminNavItems : ecommerceDemoNavItems;

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
      setSidebarOpen(false);
    } else if (hasChildren && item.children[0]?.href) {
      navigate(item.children[0].href);
      setSidebarOpen(false);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 48 : 170; /* 67% zoom: 72*0.67=48px, 250*0.67=167.5px rounded to 170px */

  return (
    <div className="layout">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}
        style={{
          display: 'block',
          visibility: 'visible',
          width: isMobile ? '260px' : `${sidebarWidth}px`
        }}
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
              <div className="logo-icon" style={{ background: isActuallyPersonalAdmin ? '#0F828A' : '#168CD6' }}>
                {isActuallyPersonalAdmin ? <FiGlobe /> : <FiPackage />}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>{isActuallyPersonalAdmin ? 'Aman Kumar' : 'Peenakaa'}</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="logo" style={{ justifyContent: 'center' }}>
              <div className="logo-icon" style={{ background: isActuallyPersonalAdmin ? '#0F828A' : '#168CD6' }}>
                {isActuallyPersonalAdmin ? <FiGlobe /> : <FiPackage />}
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
        className={`main-content ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile-view' : ''}`}
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          minWidth: 0,
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <header className="header">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle mobile navigation menu"
              style={{
                display: isMobile ? 'inline-flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                minWidth: '32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#1E293B',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <h1 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {isActuallyPersonalAdmin ? (
                    <>
                      <FiShield size={14} style={{ color: '#0F828A' }} />
                      <span>Portfolio Admin Workspace</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={14} style={{ color: '#168CD6' }} />
                      <span>Peenakaa Ecommerce Demo</span>
                    </>
                  )}
                </h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isActuallyPersonalAdmin ? 'rgba(15, 130, 138, 0.12)' : 'rgba(22, 140, 214, 0.1)',
                  color: isActuallyPersonalAdmin ? '#0F828A' : '#168CD6',
                  border: `1px solid ${isActuallyPersonalAdmin ? 'rgba(15, 130, 138, 0.25)' : 'rgba(22, 140, 214, 0.25)'}`,
                  whiteSpace: 'nowrap'
                }}>
                  {isActuallyPersonalAdmin ? 'Aman Kumar (Admin)' : 'Visitor Demo Mode'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                {isActuallyPersonalAdmin 
                  ? 'Private GA4 Traffic & Client Leads for Aman Kumar' 
                  : 'Showing public demo catalog, orders, and pricing optimizer'}
              </p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              {/* Only personal admin gets the option to preview the store demo */}
              {isActuallyPersonalAdmin ? (
                <button
                  type="button"
                  onClick={handleSwitchToDemo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: 'rgba(22, 140, 214, 0.1)',
                    border: '1px solid rgba(22, 140, 214, 0.35)',
                    color: '#168CD6',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                  title="Preview Ecommerce Demo store"
                >
                  <FiEye size={12} />
                  <span>Preview Store Demo</span>
                </button>
              ) : (
                /* In Demo mode, visitors can ONLY sign in by entering personal admin credentials */
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: 'rgba(15, 130, 138, 0.1)',
                    border: '1px solid rgba(15, 130, 138, 0.35)',
                    color: '#0F828A',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                  title="Portfolio Admin requires personal login credentials"
                >
                  <FiLock size={12} />
                  <span>Portfolio Admin Login</span>
                </button>
              )}

              {/* Currency Switcher (Demo Mode Only) */}
              {!isActuallyPersonalAdmin && <CurrencySwitcher />}

              {/* Logout button */}
              <button
                className="login-nav-btn"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Sign out / switch account"
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                Sign Out
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
                              style={{ fontSize: '8px', padding: '2px 6px', fontWeight: '500', color: '#168CD6' }}
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
