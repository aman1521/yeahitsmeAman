import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiPlus, FiRefreshCw, FiX, FiSettings, FiSave, FiAward,
  FiUsers, FiTrendingUp, FiStar, FiDollarSign, FiClock, FiFileText,
  FiEdit, FiTrash2, FiCalendar, FiTag
} from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const RewardsManagementV2 = () => {
  const { isDark } = useTheme();
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview stats
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalRedeemed: 0,
    totalExpired: 0,
    activeUsers: 0,
    netPoints: 0
  });
  
  // Users
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Adjustment form
  const [adjustPointsForm, setAdjustPointsForm] = useState({
    points_delta: '',
    reason: ''
  });
  
  // Configuration
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState({
    signup_bonus: '100',
    spend_threshold: '100',
    points_per_threshold: '10',
    conversion_rate: '0.10',
    max_usage_percent: '10',
    expiry_days: '180',
    bronze_multiplier: '1',
    silver_multiplier: '1.5',
    gold_multiplier: '2',
    platinum_multiplier: '2.5'
  });
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [conversionRate, setConversionRate] = useState(0.1); // Will be loaded from settings
  
  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [tiers, setTiers] = useState([]);
  
  useEffect(() => {
    fetchOverviewData();
    fetchConfig();
  }, [activeTab]);
  
  const fetchConfig = async () => {
    try {
      const response = await apiClient.get('/api/rewards/settings');
      if (response.data?.settings) {
        const settings = response.data.settings;
        
        // Extract values from settings object (format: {key: {value, type}})
        const getSettingValue = (key, defaultValue) => {
          if (settings[key] && typeof settings[key] === 'object' && 'value' in settings[key]) {
            const val = settings[key].value;
            // For numbers, return as number, not string
            if (settings[key].type === 'number' || typeof val === 'number') {
              return val;
            }
            // Try to parse as number if it looks like one
            if (typeof val === 'string' && !isNaN(val) && val !== '') {
              return parseFloat(val);
            }
            return String(val);
          }
          return defaultValue;
        };
        
        const configData = {
          signup_bonus: getSettingValue('signup_bonus_points', getSettingValue('signup_bonus', '100')),
          spend_threshold: getSettingValue('spending_threshold', getSettingValue('spend_threshold', '100')),
          points_per_threshold: getSettingValue('points_per_threshold', '10'),
          conversion_rate: getSettingValue('conversion_rate', getSettingValue('points_to_currency_rate', 0.10)),
          max_usage_percent: getSettingValue('max_percentage_points_payment', getSettingValue('max_usage_percent', '10')),
          expiry_days: getSettingValue('expiry_days', '180'),
          bronze_multiplier: getSettingValue('bronze_multiplier', '1'),
          silver_multiplier: getSettingValue('silver_multiplier', '1.5'),
          gold_multiplier: getSettingValue('gold_multiplier', '2'),
          platinum_multiplier: getSettingValue('platinum_multiplier', '2.5')
        };
        setConfig(configData);
        // Set conversion rate for use in transactions
        setConversionRate(parseFloat(configData.conversion_rate) || 0.1);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      // Use defaults if fetch fails
    }
  };
  
  useEffect(() => {
    // Fetch overview data when component mounts or when overview tab is active
    if (activeTab === 'overview') {
      fetchOverviewData();
    } else if (activeTab === 'transactions') {
      fetchAllTransactions();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
      fetchTiers();
    } else if (activeTab === 'stacking') {
      // Stacking tab will fetch its own data via useEffect in component
    }
  }, [activeTab]);
  
  // Fetch overview data on initial mount
  useEffect(() => {
    fetchOverviewData();
  }, []);
  
  // Inject CSS to override global card-title styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .rewards-management-page .card-title,
        .rewards-management-page h2,
        .rewards-management-page h3 {
          font-size: 8px !important;
          font-weight: 300 !important;
          line-height: 1.2 !important;
        }
      `;
      style.id = 'rewards-management-overrides-styles';
      if (!document.getElementById('rewards-management-overrides-styles')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('rewards-management-overrides-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);
  
  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      // Fetch all required data
      await Promise.all([
        fetchUsers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllTransactions = async () => {
    try {
      const response = await apiClient.get('/rewards-v2/transactions', {
        params: { limit: 100 }
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
    }
  };
  
  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get('/api/rewards/campaigns');
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
      setCampaigns([]);
    }
  };

  const fetchTiers = async () => {
    try {
      const response = await apiClient.get('/api/rewards/tiers');
      setTiers(response.data.tiers || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Failed to load tiers');
      setTiers([]);
    }
  };
  
  const fetchStats = async () => {
    try {
      console.log('[Overview] Fetching analytics...');
      const response = await apiClient.get('/rewards-v2/analytics');
      console.log('[Overview] Analytics response:', response.data);
      
      if (response.data) {
        const statsData = {
          totalIssued: response.data.total_issued || 0,
          totalRedeemed: response.data.total_redeemed || 0,
          totalExpired: response.data.total_expired || 0,
          activeUsers: response.data.total_users || 0,
          netPoints: response.data.net_points !== undefined ? response.data.net_points : (response.data.total_issued || 0) - (response.data.total_redeemed || 0) - (response.data.total_expired || 0)
        };
        console.log('[Overview] Setting stats:', statsData);
        setStats(statsData);
      } else {
        console.warn('[Overview] No data in response');
      }
    } catch (error) {
      console.error('[Overview] Error fetching stats:', error);
      console.error('[Overview] Error details:', error.response?.data || error.message);
      // Fallback to zeros if API fails
      setStats({
        totalIssued: 0,
        totalRedeemed: 0,
        totalExpired: 0,
        activeUsers: 0,
        netPoints: 0
      });
    }
  };
  
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setUsers([]);
        return;
      }
      
      // Use optimized endpoint that returns users with reward data in one call
      const response = await apiClient.get('/rewards-v2/users-with-rewards');
      
      if (response.data?.users && Array.isArray(response.data.users)) {
        const usersWithRewards = response.data.users.map(user => ({
          ...user,
          reward_points: user.reward_balance?.available_points || user.reward_points || 0,
          reward_balance: user.reward_balance || null
        }));
        
        setUsers(usersWithRewards);
      } else {
        console.error('Invalid response format:', response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to load users');
      setUsers([]);
    }
  };
  
  const fetchRecentTransactions = async () => {
    // Implement later
    setTransactions([]);
  };
  
  const handleViewDetails = async (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setLoadingDetails(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // First, check if we should use the old API endpoint
      let response;
      try {
        // Try without auth first (new endpoint doesn't require it)
        response = await apiClient.get(`/rewards-v2/user/${user.id}`);
        
        // If balance is null or empty, try alternative endpoint
        if (!response.data || !response.data.balance) {
          // Fallback to old API
          response = await apiClient.get(`/rewards/balance/${user.id}`);
          
          // Transform old API response to new format
          setUserDetails({
            balance: {
              available_points: response.data.reward_points || user.reward_points || 0,
              points_earned: 0,
              points_used: 0,
              points_expired: 0,
              user_tier: 'bronze',
              lifetime_spend: 0,
              expiring_soon_count: 0
            },
            transactions: []
          });
        } else {
          setUserDetails(response.data);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        // If new API fails, use user data from the table
        setUserDetails({
          balance: {
            available_points: user.reward_points || 0,
            points_earned: user.reward_points || 0,
            points_used: 0,
            points_expired: 0,
            user_tier: 'bronze',
            lifetime_spend: 0,
            expiring_soon_count: 0
          },
          transactions: []
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
      // Set fallback data
      setUserDetails({
        balance: {
          available_points: user.reward_points || 0,
          points_earned: user.reward_points || 0,
          points_used: 0,
          points_expired: 0,
          user_tier: 'bronze',
          lifetime_spend: 0
        },
        transactions: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };
  
  const handleAdjustPoints = async () => {
    if (!selectedUser || !adjustPointsForm.points_delta || !adjustPointsForm.reason) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const response = await apiClient.post('/rewards-v2/admin/adjust', {
        user_id: selectedUser.id,
        points_delta: parseInt(adjustPointsForm.points_delta),
        reason: adjustPointsForm.reason
      });
      
      toast.success(`Points adjusted successfully! New balance: ${response.data.balance || response.data.reward_points}`);
      setAdjustPointsForm({ points_delta: '', reason: '' });
      
      // Refresh users list FIRST to update the table
      await fetchUsers();
      
      // Then refresh user details with updated data
      await handleViewDetails(selectedUser);
      
      console.log('[Rewards] Points adjustment successful, lists refreshed');
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error(error.response?.data?.error || 'Failed to adjust points');
    }
  };
  
  // Filter by search term - empty search shows all
  const filteredUsers = users.filter(user => {
    // If search is empty, show all
    if (!searchTerm || searchTerm.trim() === '') return true;
    const search = searchTerm.toLowerCase().trim();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search))
    );
  });
  
  // Theme-aware styles
  const themeStyles = {
    container: {
      background: 'transparent',
      minHeight: '100vh',
      padding: '0',
      color: '#1e293b',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      color: '#1e293b',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    },
    heading: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: isDark ? '#e2e8f0' : '#1e293b'
    },
    textSecondary: {
      color: isDark ? '#cbd5e1' : '#64748b',
      margin: 0
    },
    buttonSecondary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: isDark ? '#334155' : '#f1f5f9',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      color: isDark ? '#e2e8f0' : '#475569',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      background: '#FF8C00',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      color: 'white'
    },
    tabButton: (isActive) => ({
      padding: '12px 24px',
      background: isActive ? '#FF8C00' : 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      color: isActive ? 'white' : (isDark ? '#cbd5e1' : '#64748b'),
      transition: 'all 0.2s ease',
      ...(isDark && !isActive && {
        '&:hover': {
          background: '#334155'
        }
      })
    })
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: themeStyles.container.background }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }}></div>
          <p style={{ color: themeStyles.textSecondary.color }}>Loading Reward Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container rewards-management-page" style={{ ...themeStyles.container, padding: '12px 14px' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '14px', marginBottom: '2px', lineHeight: '1.3', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Rewards Management
          </h1>
          <p className="page-subtitle" style={{ fontSize: '9px', margin: 0, lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#64748b' }}>
            Manage customer loyalty rewards, tiers, and campaigns
          </p>
        </div>
        
        <div className="page-header-actions" style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          alignItems: 'center', 
          gap: '6px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setShowConfigModal(true)}
            className="btn btn-secondary"
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
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
              e.currentTarget.style.borderColor = isDark ? '#475569' : '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }}
          >
            <FiSettings style={{ fontSize: '10px' }} /> Config
          </button>
          
          <button
            onClick={async () => {
              if (activeTab === 'overview') {
                await fetchOverviewData();
              } else if (activeTab === 'transactions') {
                await fetchAllTransactions();
              } else if (activeTab === 'campaigns') {
                await fetchCampaigns();
                await fetchTiers();
              } else if (activeTab === 'users') {
                await fetchUsers();
              }
              toast.success('Data refreshed');
            }}
            className="btn btn-primary"
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
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff9500 0%, #ffa500 100%)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(255, 140, 0, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 0, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FiRefreshCw style={{ fontSize: '10px' }} /> Refresh
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          background: isDark ? '#1e293b' : 'white',
          padding: '4px',
          borderRadius: '8px',
          boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          {['overview', 'users', 'transactions', 'stacking', 'campaigns', 'test'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '5px 10px',
                background: activeTab === tab ? 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '500',
                fontSize: '9px',
                color: activeTab === tab ? 'white' : (isDark ? '#cbd5e1' : '#64748b'),
                transition: 'all 0.2s ease',
                minHeight: '24px',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(255, 140, 0, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                  e.currentTarget.style.color = isDark ? '#e2e8f0' : '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isDark ? '#cbd5e1' : '#64748b';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
            <StatCard 
              title="Total Points Issued"
              value={stats.totalIssued.toLocaleString()}
              color="#FF8C00"
              icon={<FiAward />}
              isDark={isDark}
            />
            <StatCard 
              title="Total Redeemed"
              value={stats.totalRedeemed.toLocaleString()}
              color="#10b981"
              icon={<FiTrendingUp />}
              isDark={isDark}
            />
            <StatCard 
              title="Points Expired"
              value={stats.totalExpired.toLocaleString()}
              color="#f59e0b"
              icon={<FiClock />}
              isDark={isDark}
            />
            <StatCard 
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              color="#8b5cf6"
              icon={<FiUsers />}
              isDark={isDark}
            />
          </div>
          
          {/* Summary Card - Net Points Available */}
          {stats.netPoints !== undefined && (
            <div style={{
              background: stats.netPoints >= 0 
                ? (isDark ? 'linear-gradient(135deg, #1e293b 0%, #064e3b 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)')
                : (isDark ? 'linear-gradient(135deg, #1e293b 0%, #7f1d1d 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'),
              padding: '12px 14px',
              borderRadius: '8px',
              boxShadow: stats.netPoints >= 0 
                ? (isDark ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.15)')
                : (isDark ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(239, 68, 68, 0.15)'),
              border: isDark ? `2px solid ${stats.netPoints >= 0 ? '#10b98150' : '#ef444450'}` : `2px solid ${stats.netPoints >= 0 ? '#10b98140' : '#ef444440'}`,
              marginBottom: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ 
                    fontSize: '10px', 
                    fontWeight: '700', 
                    margin: '0 0 5px 0', 
                    color: isDark ? '#e2e8f0' : '#1e293b',
                    lineHeight: '1.3',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Net Points Available
                  </h3>
                  <p style={{ 
                    fontSize: '8px', 
                    color: isDark ? '#cbd5e1' : '#64748b', 
                    margin: 0,
                    lineHeight: '1.4',
                    fontWeight: '500'
                  }}>
                    Total points currently available in the system (Issued - Redeemed - Expired)
                  </p>
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: stats.netPoints >= 0 ? '#10b981' : '#ef4444',
                  lineHeight: '1.2',
                  textShadow: `0 2px 4px ${stats.netPoints >= 0 ? '#10b98140' : '#ef444440'}`,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {stats.netPoints.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'users' && <UsersTab users={filteredUsers} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onViewDetails={handleViewDetails} isDark={isDark} />}
      {activeTab === 'transactions' && <TransactionsTab transactions={transactions} conversionRate={conversionRate} isDark={isDark} />}
      {activeTab === 'stacking' && <StackingInsightsTab isDark={isDark} />}
      {activeTab === 'campaigns' && <CampaignsTab campaigns={campaigns} tiers={tiers} onRefresh={fetchCampaigns} onEdit={(campaign) => { setEditingCampaign(campaign); setShowCampaignModal(true); }} onCreate={() => { setEditingCampaign(null); setShowCampaignModal(true); }} isDark={isDark} />}
      
      {activeTab === 'test' && <TestTab users={users} onRefresh={fetchUsers} isDark={isDark} />}
      
      {/* Tier Modal */}
      {showTierModal && (
        <TierModal
          tier={editingTier}
          onClose={() => {
            setShowTierModal(false);
            setEditingTier(null);
          }}
          onSave={async () => {
            await fetchTiers();
            setShowTierModal(false);
            setEditingTier(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          campaign={editingCampaign}
          tiers={tiers}
          onClose={() => {
            setShowCampaignModal(false);
            setEditingCampaign(null);
          }}
          onSave={async () => {
            await fetchCampaigns();
            setShowCampaignModal(false);
            setEditingCampaign(null);
          }}
          isDark={isDark}
        />
      )}
      
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          userDetails={userDetails}
          loading={loadingDetails}
          onClose={async () => {
            setShowUserDetails(false);
            setSelectedUser(null);
            setUserDetails(null);
            // Refresh users list to show updated tier
            await fetchUsers();
          }}
          onRefresh={async () => {
            await handleViewDetails(selectedUser);
          }}
          onAdjustPoints={handleAdjustPoints}
          adjustForm={adjustPointsForm}
          setAdjustForm={setAdjustPointsForm}
          isDark={isDark}
        />
      )}
      
      {/* Configuration Modal */}
      {showConfigModal && (
        <ConfigModal
          config={config}
          setConfig={setConfig}
          onClose={() => setShowConfigModal(false)}
          onSave={async () => {
            try {
              // Map frontend config keys to backend setting keys
              const settingsToSave = {
                signup_bonus: config.signup_bonus,
                spend_threshold: config.spend_threshold,
                points_per_threshold: config.points_per_threshold,
                conversion_rate: parseFloat(config.conversion_rate) || 0.10, // Save as conversion_rate (matches DB)
                max_usage_percent: config.max_usage_percent,
                expiry_days: config.expiry_days,
                bronze_multiplier: config.bronze_multiplier,
                silver_multiplier: config.silver_multiplier,
                gold_multiplier: config.gold_multiplier,
                platinum_multiplier: config.platinum_multiplier
              };
              
              await apiClient.put('/api/rewards/settings', settingsToSave);
              toast.success('Configuration saved successfully!');
              setShowConfigModal(false);
              // Refresh config to get updated values
              await fetchConfig();
              // Refresh conversion rate for transactions tab
              if (activeTab === 'transactions') {
                await fetchAllTransactions();
              }
            } catch (error) {
              console.error('Error saving configuration:', error);
              const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save configuration';
              toast.error(errorMessage);
            }
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color, icon, isDark }) => {
  const cardStyle = {
    background: isDark ? '#1e293b' : 'white',
    padding: '10px 12px',
    borderRadius: '8px',
    boxShadow: isDark ? `0 3px 8px rgba(0,0,0,0.4), 0 0 0 1px ${color}40` : `0 2px 6px rgba(0,0,0,0.12), 0 0 0 1px ${color}30`,
    border: isDark ? `2px solid ${color}50` : `2px solid ${color}40`,
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden'
  };
  
  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark ? `0 6px 12px rgba(0,0,0,0.5), 0 0 0 2px ${color}60` : `0 4px 10px rgba(0,0,0,0.18), 0 0 0 2px ${color}50`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark ? `0 3px 8px rgba(0,0,0,0.4), 0 0 0 1px ${color}40` : `0 2px 6px rgba(0,0,0,0.12), 0 0 0 1px ${color}30`;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '8px', color: isDark ? '#cbd5e1' : '#64748b', fontWeight: '700', lineHeight: '1.2', letterSpacing: '0.3px' }}>{title}</span>
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          fontSize: '11px',
          boxShadow: `0 1px 3px ${color}30`
        }}>
          {icon}
        </div>
      </div>
      <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3', fontFamily: 'system-ui, -apple-system, sans-serif', textShadow: `0 1px 2px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}` }}>
        {value}
      </h2>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, searchTerm, setSearchTerm, onViewDetails, isDark }) => {
  const cardStyle = {
    background: isDark ? '#1e293b' : 'white',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '10px',
    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '6px 12px 6px 36px',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '6px',
    fontSize: '9px',
    outline: 'none',
    background: isDark ? '#0f172a' : 'white',
    color: isDark ? '#e2e8f0' : '#1e293b',
    transition: 'all 0.2s ease'
  };
  
  return (
    <div>
      {/* Search Bar */}
      <div style={cardStyle}>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '14px'
          }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
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
      </div>
      
      {/* Users Table */}
      <div className="table-container" style={{
        background: isDark ? '#1e293b' : 'white',
        borderRadius: '8px',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {users.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
            <FiUsers style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3, color: isDark ? '#475569' : '#94a3b8' }} />
            <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#475569' }}>No Users Found</p>
            <p style={{ fontSize: '8px', lineHeight: '1.3', color: isDark ? '#94a3b8' : '#64748b' }}>No users with reward data found. Run the seed script to create demo users.</p>
          </div>
        ) : (
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0', width: '100%' }}>
            <thead>
              <tr style={{ background: isDark ? '#0f172a' : '#f8fafc' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>USER</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>EMAIL</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>TIER</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>POINTS</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
              <tr 
                key={user.id}
                style={{ 
                  borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                  transition: 'all 0.2s ease',
                  background: isDark ? '#1e293b' : 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? '#1e293b' : 'white';
                }}
              >
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isDark ? '#334155' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: isDark ? '#e2e8f0' : '#475569',
                      fontSize: '10px',
                      boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {user.full_name?.charAt(0) || 'G'}
                    </div>
                    <span style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '9px', lineHeight: '1.3' }}>
                      {user.full_name || 'Guest User'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', color: isDark ? '#cbd5e1' : '#64748b', fontSize: '9px', lineHeight: '1.3' }}>{user.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  {(() => {
                    const tier = user.reward_balance?.user_tier || 'bronze';
                    const tierColors = {
                      bronze: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' },
                      silver: { bg: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)', color: '#4b5563' },
                      gold: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#d97706' },
                      platinum: { bg: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)', color: '#7c3aed' }
                    };
                    const colors = tierColors[tier] || tierColors.bronze;
                    return (
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '8px',
                        fontWeight: '600',
                        background: colors.bg,
                        color: colors.color,
                        textTransform: 'capitalize',
                        boxShadow: `0 1px 2px ${colors.color}20`,
                        lineHeight: '1.2'
                      }}>
                        {tier}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#FF8C00', fontSize: '10px', lineHeight: '1.3' }}>
                  {user.reward_points || 0}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => onViewDetails(user)}
                    className="btn btn-primary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '8px',
                      fontWeight: '600',
                      background: 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
                      transition: 'all 0.2s ease',
                      minHeight: '22px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ff9500 0%, #ffa500 100%)';
                      e.currentTarget.style.boxShadow = '0 3px 6px rgba(255, 140, 0, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 0, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ transactions, conversionRate = 0.1, isDark }) => {
  return (
    <div>
      {/* Transactions Table */}
      <div className="table-container" style={{
        background: isDark ? '#1e293b' : 'white',
        borderRadius: '8px',
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {!transactions || transactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
            <FiFileText style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3, color: isDark ? '#475569' : '#94a3b8' }} />
            <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#475569' }}>No Transactions Found</p>
            <p style={{ fontSize: '8px', lineHeight: '1.3', color: isDark ? '#94a3b8' : '#64748b' }}>No reward transactions have been recorded yet.</p>
          </div>
        ) : (
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0', width: '100%' }}>
            <thead>
              <tr style={{ background: isDark ? '#0f172a' : '#f8fafc' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>DATE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>USER</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>TYPE</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>POINTS</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>VALUE</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', fontSize: '9px', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>REMARKS</th>
              </tr>
            </thead>
            <tbody>
            {transactions.map((transaction, index) => {
              const isEarned = transaction.transaction_type === 'earned' || transaction.transaction_type === 'admin_adjust';
              const isDeducted = transaction.transaction_type === 'redeemed' || transaction.transaction_type === 'used' || transaction.transaction_type === 'expired';
              
              // For deducted transactions, ensure negative value is shown with minus sign
              // Backend stores negative values for used/redeemed, so respect that
              let displayPoints = transaction.points;
              if (isDeducted) {
                // If points are already negative, use as-is; otherwise make negative
                displayPoints = transaction.points < 0 ? transaction.points : -Math.abs(transaction.points);
              } else {
                // For earned, ensure positive
                displayPoints = Math.abs(transaction.points);
              }
              
              return (
                <tr 
                  key={transaction.id || index}
                  style={{ 
                    borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                    transition: 'all 0.2s ease',
                    background: isDark ? '#1e293b' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? '#1e293b' : 'white';
                  }}
                >
                  <td style={{ padding: '10px 12px', color: isDark ? '#cbd5e1' : '#64748b', fontSize: '9px', lineHeight: '1.3' }}>
                    {transaction.created_at 
                      ? new Date(transaction.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : '-'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isDark ? '#334155' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: isDark ? '#e2e8f0' : '#475569',
                        fontSize: '10px',
                        boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {(transaction.user_name || transaction.full_name || `User #${transaction.user_id}`).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '9px', lineHeight: '1.3' }}>
                        {transaction.user_name || transaction.full_name || `User #${transaction.user_id}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '8px',
                      fontWeight: '600',
                      background: isEarned ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      color: isEarned ? '#16a34a' : '#dc2626',
                      textTransform: 'capitalize',
                      boxShadow: isEarned ? '0 1px 2px rgba(22, 163, 74, 0.2)' : '0 1px 2px rgba(220, 38, 38, 0.2)',
                      lineHeight: '1.2'
                    }}>
                      {transaction.transaction_type === 'admin_adjust' ? 'Earned' : transaction.transaction_type === 'used' ? 'Used' : transaction.transaction_type}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '10px 12px',
                    textAlign: 'right', 
                    fontWeight: '700', 
                    color: isEarned ? '#10b981' : '#ef4444', 
                    fontSize: '10px',
                    lineHeight: '1.3'
                  }}>
                    {displayPoints !== 0 && (displayPoints > 0 ? '+' : '')}{displayPoints}
                  </td>
                  <td style={{ 
                    padding: '10px 12px',
                    textAlign: 'right',
                    fontWeight: '700',
                    color: isEarned ? '#10b981' : '#ef4444',
                    fontSize: '10px',
                    lineHeight: '1.3'
                  }}>
                    {isDeducted ? '-' : ''}₹{transaction.value_in_currency ? Math.abs(transaction.value_in_currency).toFixed(2) : (Math.abs(transaction.points || 0) * conversionRate).toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '10px 12px',
                    color: isDark ? '#cbd5e1' : '#64748b',
                    fontSize: '9px',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.3'
                  }}>
                    {transaction.description || transaction.reason || '-'}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Campaigns Tab Component
const CampaignsTab = ({ campaigns, tiers, onRefresh, onEdit, onCreate, isDark }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'multiplier',
    multiplier_value: 2,
    bonus_points: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicable_tiers: ['bronze', 'silver', 'gold', 'platinum'],
    is_active: true
  });
  
  const handleCreateCampaign = async () => {
    setCreating(true);
    try {
      if (editingCampaignId) {
        await apiClient.put(`/reward-campaigns/campaigns/${editingCampaignId}`, formData);
        toast.success('Campaign updated successfully!');
      } else {
        await apiClient.post('/reward-campaigns/campaigns', formData);
        toast.success('Campaign created successfully!');
      }
      setShowCreateModal(false);
      setEditingCampaignId(null);
      setFormData({
        name: '',
        description: '',
        campaign_type: 'multiplier',
        multiplier_value: 2,
        bonus_points: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicable_tiers: ['bronze', 'silver', 'gold', 'platinum'],
        is_active: true
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };
  
  const isCampaignActive = (campaign) => {
    if (!campaign.is_active) return false;
    
    // Get current date in IST (India Standard Time)
    const now = new Date();
    // Convert to IST: UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000));
    
    // Set to start of day for accurate date comparison (IST)
    const todayIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate());
    
    // Parse campaign dates - handle both date strings and datetime strings
    let validFrom = new Date(campaign.valid_from);
    // If date string doesn't include time, assume start of day IST
    if (!campaign.valid_from.includes('T')) {
      validFrom = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
    } else {
      // If datetime string, extract date part only for comparison
      validFrom = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
    }
    
    let validUntil = new Date(campaign.valid_until);
    // Handle date-only vs datetime strings
    if (!campaign.valid_until.includes('T')) {
      // Date-only: set to end of day IST
      validUntil = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate(), 23, 59, 59);
    } else {
      // Datetime string: extract date and set to end of day
      validUntil = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate(), 23, 59, 59);
    }
    
    // Compare dates
    return todayIST >= validFrom && todayIST <= validUntil;
  };
  
  const cardStyle = {
    background: isDark ? '#1e293b' : 'white',
    padding: '10px 12px',
    borderRadius: '8px',
    boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    color: isDark ? '#e2e8f0' : '#1e293b'
  };
  
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h2 style={{ fontSize: '10px', fontWeight: '600', margin: '0 0 3px 0', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3' }}>Reward Campaigns</h2>
          <p style={{ fontSize: '8px', color: isDark ? '#cbd5e1' : '#64748b', margin: 0, lineHeight: '1.3' }}>
            {campaigns.filter(c => isCampaignActive(c)).length} active campaign(s)
          </p>
        </div>
        <button 
          onClick={() => {
            if (onCreate) {
              onCreate();
            } else {
              setShowCreateModal(true);
              setEditingCampaignId(null);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            background: '#FF8C00',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '9px',
            minHeight: '24px',
            boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ff9500';
            e.currentTarget.style.boxShadow = '0 3px 6px rgba(255, 140, 0, 0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FF8C00';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 0, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FiPlus style={{ fontSize: '10px' }} /> New Campaign
        </button>
      </div>
      
      {campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <FiCalendar style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3, color: isDark ? '#475569' : '#94a3b8' }} />
          <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#475569' }}>No Campaigns</p>
          <p style={{ fontSize: '8px', lineHeight: '1.3', color: isDark ? '#94a3b8' : '#64748b' }}>No reward campaigns have been created yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {campaigns.map((campaign) => {
            const isActive = isCampaignActive(campaign);
            const now = new Date();
            const validFrom = new Date(campaign.valid_from);
            const validUntil = new Date(campaign.valid_until);
            
            return (
              <div 
                key={campaign.id}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : isDark ? '#1e293b' : 'white',
                  border: `1px solid ${isActive ? '#86efac' : (isDark ? '#334155' : '#e2e8f0')}`,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  boxShadow: isActive ? '0 2px 6px rgba(34, 197, 94, 0.15)' : (isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'),
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = isActive ? '0 4px 8px rgba(34, 197, 94, 0.2)' : (isDark ? '0 2px 6px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.15)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isActive ? '0 2px 6px rgba(34, 197, 94, 0.15)' : (isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '9px', fontWeight: '600', margin: '0 0 3px 0', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {campaign.name}
                      {isActive && (
                        <span style={{
                          padding: '2px 8px',
                          background: '#22c55e',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '7px',
                          fontWeight: '600',
                          boxShadow: '0 1px 3px rgba(34, 197, 94, 0.3)'
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </h3>
                    <p style={{ fontSize: '8px', color: isDark ? '#cbd5e1' : '#64748b', lineHeight: '1.3', margin: 0 }}>
                      {campaign.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => onEdit && onEdit(campaign)}
          style={{ 
            padding: '4px 8px', 
            border: '1px solid #e2e8f0', 
            background: 'white', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: '500', 
            color: '#1e293b', 
            fontSize: '8px', 
            minHeight: '22px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
          }}
        >
          Edit
        </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
                          try {
                            await apiClient.delete(`/api/rewards/campaigns/${campaign.id}`);
                            toast.success('Campaign deleted successfully!');
                            if (onRefresh) onRefresh();
                          } catch (error) {
                            toast.error(error.response?.data?.error || 'Failed to delete campaign');
                          }
                        }
                      }}
                      style={{ 
                        padding: '4px 8px', 
                        border: '1px solid #fee2e2', 
                        background: '#fee2e2', 
                        borderRadius: '5px', 
                        cursor: 'pointer', 
                        fontWeight: '500', 
                        color: '#dc2626', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '8px', 
                        minHeight: '22px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(220, 38, 38, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fecaca';
                        e.currentTarget.style.borderColor = '#fca5a5';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fee2e2';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(220, 38, 38, 0.1)';
                      }}
                    >
                      <FiTrash2 style={{ fontSize: '9px' }} /> Delete
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '7px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '3px', lineHeight: '1.2', fontWeight: '500' }}>Type</p>
                    <p style={{ fontSize: '9px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3', margin: 0 }}>
                      {campaign.campaign_type === 'multiplier' ? `${campaign.multiplier_value || campaign.bonus_multiplier || 1}× Multiplier` : 
                       campaign.campaign_type === 'bonus_points' ? `${campaign.bonus_points || 0} Bonus Points` :
                       campaign.campaign_type === 'cashback' ? `Cashback` :
                       'Unknown Type'}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '7px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '3px', lineHeight: '1.2', fontWeight: '500' }}>Valid Until</p>
                    <p style={{ fontSize: '9px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: '1.3', margin: 0 }}>
                      {new Date(campaign.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {campaign.applicable_tiers && campaign.applicable_tiers.length > 0 && (
                  <div>
                    <p style={{ fontSize: '7px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px', lineHeight: '1.2', fontWeight: '500' }}>Applicable Tiers</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(Array.isArray(campaign.applicable_tiers) ? campaign.applicable_tiers : []).map((tier) => (
                        <span 
                          key={tier}
                          style={{
                            padding: '3px 8px',
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            color: '#6366f1',
                            borderRadius: '6px',
                            fontSize: '7px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            lineHeight: '1.2',
                            boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          {tier}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal" onClick={() => setShowCreateModal(false)} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Create New Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX style={{ fontSize: '24px', color: '#64748b' }} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Campaign Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Double Rewards Weekend"
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Campaign description"
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Campaign Type</label>
                  <select 
                    value={formData.campaign_type}
                    onChange={(e) => setFormData({...formData, campaign_type: e.target.value})}
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  >
                    <option value="multiplier">Multiplier</option>
                    <option value="bonus_points">Bonus Points</option>
                    <option value="cashback">Cashback</option>
                  </select>
                </div>
                
                {formData.campaign_type === 'multiplier' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Multiplier Value</label>
                    <input 
                      type="number" 
                      value={formData.multiplier_value || ''}
                      onChange={(e) => setFormData({...formData, multiplier_value: e.target.value ? parseFloat(e.target.value) : 1.0})}
                      min="0.1"
                      step="0.1"
                      style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </div>
                )}
                
                {formData.campaign_type === 'bonus_points' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Bonus Points</label>
                    <input 
                      type="number" 
                      value={formData.bonus_points || ''}
                      onChange={(e) => setFormData({...formData, bonus_points: e.target.value ? parseInt(e.target.value) : 0})}
                      min="0"
                      style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Valid From *</label>
                  <input 
                    type="date" 
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}  // Prevent past dates
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    required
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Campaign cannot start in the past
                  </p>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Valid Until *</label>
                  <input 
                    type="date" 
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    min={formData.valid_from || new Date().toISOString().split('T')[0]}  // Must be after start date
                    style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    required
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Must be after start date
                  </p>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <span style={{ fontSize: '14px', color: '#1e293b' }}>Active</span>
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={creating || !formData.name || !formData.valid_from || !formData.valid_until}
                style={{ flex: 1, padding: '10px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: (!formData.name || !formData.valid_from || !formData.valid_until) ? 0.5 : 1 }}
              >
                {creating ? (editingCampaignId ? 'Saving...' : 'Creating...') : (editingCampaignId ? 'Save Changes' : 'Create Campaign')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stacking Insights Tab Component
const StackingInsightsTab = ({ isDark }) => {
  const [stackedTransactions, setStackedTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [transResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/reward-stacking/stacked-transactions'),
        apiClient.get('/reward-stacking/stacking-analytics')
      ]);
      
      setStackedTransactions(transResponse.data.transactions || []);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: isDark ? '#1e293b' : 'white', borderRadius: '12px' }}>
        <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto' }}></div>
        <p style={{ marginTop: '16px', color: isDark ? '#cbd5e1' : '#64748b' }}>Loading stacking insights...</p>
      </div>
    );
  }
  
  const cardStyle = {
    background: isDark ? '#1e293b' : 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
    border: isDark ? '1px solid #334155' : 'none',
    color: isDark ? '#e2e8f0' : '#1e293b'
  };
  
  const thStyle = {
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '9px',
    fontWeight: '700',
    color: isDark ? '#cbd5e1' : '#475569',
    textTransform: 'uppercase',
    background: isDark ? '#0f172a' : '#f8fafc',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    letterSpacing: '0.5px'
  };
  
  const tdStyle = {
    padding: '10px 12px',
    fontSize: '9px',
    color: isDark ? '#e2e8f0' : '#1e293b',
    borderTop: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
    lineHeight: '1.3'
  };
  
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: isDark ? '#1e293b' : 'white',
    color: isDark ? '#e2e8f0' : '#1e293b'
  };
  
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <StatCard 
            title="Total Stacked Orders"
            value={analytics.overview?.total_stacked || 0}
            color="#8b5cf6"
            icon={<FiTag />}
            isDark={isDark}
          />
          <StatCard 
            title="Avg Discount/Order"
            value={`₹${analytics.overview?.average_discount_per_order?.toFixed(2) || '0.00'}`}
            color="#FF8C00"
            icon={<FiDollarSign />}
            isDark={isDark}
          />
          <StatCard 
            title="Total Savings"
            value={`₹${analytics.total_savings_generated?.toFixed(2) || '0.00'}`}
            color="#10b981"
            icon={<FiTrendingUp />}
            isDark={isDark}
          />
          <StatCard 
            title="Stacked %"
            value={`${analytics.overview?.stacked_percentage || 0}%`}
            color="#f59e0b"
            icon={<FiStar />}
            isDark={isDark}
          />
        </div>
      )}
      
      {/* Stacked Transactions Table */}
      <div style={{
        ...cardStyle,
        boxShadow: isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
      }}>
        <div style={{ 
          padding: '10px 12px', 
          borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          background: isDark ? '#0f172a' : '#f8fafc'
        }}>
          <h2 style={{ 
            fontSize: '12px', 
            fontWeight: '700', 
            margin: '0 0 3px 0', 
            color: isDark ? '#e2e8f0' : '#1e293b',
            lineHeight: '1.3'
          }}>
            Stacked Transactions ({stackedTransactions.length})
          </h2>
          <p style={{ 
            fontSize: '8px', 
            color: isDark ? '#cbd5e1' : '#64748b', 
            margin: 0,
            lineHeight: '1.3',
            fontWeight: '500'
          }}>
            Orders using both coupon + reward points together
          </p>
        </div>
        
        {stackedTransactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
            <FiTag style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3, color: isDark ? '#475569' : '#94a3b8' }} />
            <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.3', color: isDark ? '#cbd5e1' : '#475569' }}>No Stacked Transactions Yet</p>
            <p style={{ fontSize: '8px', lineHeight: '1.3', color: isDark ? '#94a3b8' : '#64748b' }}>No orders have used both coupons and rewards together yet.</p>
          </div>
        ) : (
      <div style={{ maxHeight: '600px', overflow: 'auto', background: isDark ? '#1e293b' : 'white' }}>
        <table style={tableStyle}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={thStyle}>Order</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Coupon</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Coupon Discount</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Points Used</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Reward Value</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stackedTransactions.map((trans) => {
                  const statusColors = {
                    'paid': '#22c55e',
                    'completed': '#22c55e',
                    'pending': '#f59e0b',
                    'processing': '#FF8C00',
                    'shipped': '#8b5cf6',
                    'delivered': '#10b981',
                    'cancelled': '#ef4444',
                    'refunded': '#ef4444',
                    'failed': '#ef4444'
                  };
                  
                  return (
                    <tr 
                      key={trans.id} 
                      style={{ 
                        ...tdStyle,
                        background: 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#334155' : '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={tdStyle}>
                        {trans.order_number || `#${trans.order_id || '—'}`}
                      </td>
                      <td style={tdStyle}>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                            {trans.user || 'Unknown'}
                          </p>
                          <p style={{ fontSize: '8px', color: isDark ? '#94a3b8' : '#64748b', margin: 0, fontWeight: '500', lineHeight: '1.2' }}>
                            {trans.tier ? trans.tier.toUpperCase() : 'BRONZE'} Tier
                          </p>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '3px 8px',
                          background: trans.coupon_code && trans.coupon_code !== 'N/A' 
                            ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' 
                            : (isDark ? '#334155' : '#f1f5f9'),
                          color: trans.coupon_code && trans.coupon_code !== 'N/A' ? '#FF8C00' : (isDark ? '#94a3b8' : '#64748b'),
                          borderRadius: '6px',
                          fontSize: '8px',
                          fontWeight: '700',
                          boxShadow: trans.coupon_code && trans.coupon_code !== 'N/A' ? '0 1px 2px rgba(255, 140, 0, 0.2)' : 'none'
                        }}>
                          {trans.coupon_code || 'Manual Discount'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#10b981', fontWeight: '700', fontSize: '10px' }}>
                        -₹{trans.coupon_discount ? trans.coupon_discount.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#FF8C00', fontWeight: '700', fontSize: '10px' }}>
                        {trans.reward_points_used || 0}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: '#f59e0b', fontWeight: '700', fontSize: '10px' }}>
                        -₹{trans.reward_value ? trans.reward_value.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '8px',
                          fontWeight: '700',
                          background: statusColors[trans.status] || '#94a3b8',
                          color: 'white',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          boxShadow: `0 2px 4px ${statusColors[trans.status] || '#94a3b8'}40`,
                          display: 'inline-block'
                        }}>
                          {trans.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedDetails(trans)}
                          style={{
                            padding: '4px 10px',
                            background: 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
                            transition: 'all 0.2s ease',
                            minHeight: '22px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ff9500 0%, #ffa500 100%)';
                            e.currentTarget.style.boxShadow = '0 3px 6px rgba(255, 140, 0, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #ff9500 100%)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 140, 0, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Details Modal */}
      {selectedDetails && (
        <div className="modal" onClick={() => setSelectedDetails(null)} style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: isDark ? '#1e293b' : 'white', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', border: isDark ? '1px solid #334155' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: isDark ? '#e2e8f0' : '#1e293b' }}>Stacking Details</h3>
              <button onClick={() => setSelectedDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX style={{ fontSize: '24px', color: isDark ? '#94a3b8' : '#64748b' }} />
              </button>
            </div>
            
            {/* Customer Info */}
            <div style={{ background: isDark ? '#334155' : '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>Customer</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b', margin: 0 }}>{selectedDetails.user || 'Unknown'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>Tier</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', margin: 0, textTransform: 'uppercase' }}>{selectedDetails.tier || 'BRONZE'}</p>
                </div>
              </div>
            </div>

            {/* Discount Breakdown */}
            <div style={{ background: isDark ? '#334155' : '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: isDark ? '#e2e8f0' : '#1e293b' }}>Stacking Breakdown</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? '#1e293b' : 'white', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#64748b' }}>Coupon ({selectedDetails.coupon_code || 'Manual Discount'})</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>-₹{selectedDetails.coupon_discount ? selectedDetails.coupon_discount.toFixed(2) : '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? '#1e293b' : 'white', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#64748b' }}>Reward Points ({selectedDetails.reward_points_used || 0} pts)</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#FF8C00' }}>-₹{((selectedDetails.reward_points_used || 0) * 0.1).toFixed(2)}</span>
                </div>
                <div style={{ borderTop: `2px solid ${isDark ? '#475569' : '#e2e8f0'}`, paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>Total Savings</span>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6' }}>₹{((selectedDetails.coupon_discount || 0) + ((selectedDetails.reward_points_used || 0) * 0.1)).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>Final Order Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: isDark ? '#e2e8f0' : '#1e293b' }}>₹{selectedDetails.total_amount ? selectedDetails.total_amount.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedDetails(null)}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`, 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: '600', 
                  color: isDark ? '#cbd5e1' : '#64748b',
                  background: isDark ? '#334155' : 'white'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value, color, bold, isDark }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '14px', color: isDark ? '#cbd5e1' : '#64748b' }}>{label}</span>
    <span style={{ fontSize: '14px', color: color || (isDark ? '#e2e8f0' : '#1e293b'), fontWeight: bold ? '700' : '600' }}>{value}</span>
  </div>
);

// Config Section Component
const ConfigSection = ({ title, config, setConfig, fields, isDark }) => {
  const sectionBg = isDark ? '#334155' : '#f8fafc';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#475569' : '#e2e8f0';
  const inputBg = isDark ? '#1e293b' : 'white';
  const labelColor = isDark ? '#cbd5e1' : '#64748b';
  
  return (
    <div style={{ 
      marginBottom: '24px', 
      padding: '20px', 
      background: sectionBg, 
      borderRadius: '12px',
      border: `1px solid ${borderColor}`
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {fields.map(field => (
          <div key={field.key}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px', 
              color: labelColor 
            }}>
              {field.label}
            </label>
            <input
              type={field.type || 'text'}
              value={config[field.key] !== undefined && config[field.key] !== null ? String(config[field.key]) : ''}
              onChange={(e) => {
                // For number inputs, allow free typing (store as string during typing)
                // Parse to number on blur
                const inputValue = e.target.value;
                if (field.type === 'number') {
                  // Allow empty string, numbers, decimals, and negative signs
                  if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                    setConfig({ ...config, [field.key]: inputValue });
                  }
                } else {
                  setConfig({ ...config, [field.key]: inputValue });
                }
              }}
              onBlur={(e) => {
                // Parse to number on blur for number inputs
                if (field.type === 'number') {
                  const numValue = e.target.value === '' ? '' : (parseFloat(e.target.value) || 0);
                  setConfig({ ...config, [field.key]: numValue });
                }
                e.target.style.border = `1px solid ${borderColor}`;
              }}
              step={field.step || undefined}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                fontSize: '14px',
                background: inputBg,
                color: textColor,
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #FF8C00';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Configuration Modal Component
const ConfigModal = ({ config, setConfig, onClose, onSave, isDark }) => {
  const modalBg = isDark ? '#1e293b' : 'white';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#475569' : '#e2e8f0';
  const inputBg = isDark ? '#334155' : 'white';
  const labelColor = isDark ? '#cbd5e1' : '#64748b';
  
  return (
  <div className="modal" onClick={onClose} style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      background: modalBg,
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      border: isDark ? '1px solid #334155' : 'none',
      color: textColor
    }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: textColor }}>Reward Configuration</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX style={{ fontSize: '18px', color: isDark ? '#94a3b8' : '#64748b' }} />
          </button>
        </div>
      </div>
      
      <div style={{ padding: '12px 14px' }}>
        <ConfigSection 
          title="Basic Settings"
          config={config}
          setConfig={setConfig}
          fields={[
            { key: 'signup_bonus', label: 'Signup Bonus Points', type: 'number' },
            { key: 'spend_threshold', label: 'Spending Threshold (₹)', type: 'number' },
            { key: 'points_per_threshold', label: 'Points Per Threshold', type: 'number' }
          ]}
          isDark={isDark}
        />
        
        <ConfigSection 
          title="Redemption Settings"
          config={config}
          setConfig={setConfig}
          fields={[
            { key: 'conversion_rate', label: 'Point to Currency Rate', type: 'number', step: '0.01' },
            { key: 'max_usage_percent', label: 'Max Usage Percentage (%)', type: 'number' },
            { key: 'expiry_days', label: 'Points Expiry (Days)', type: 'number' }
          ]}
          isDark={isDark}
        />
        
        <ConfigSection 
          title="Tier Multipliers"
          config={config}
          setConfig={setConfig}
          fields={[
            { key: 'bronze_multiplier', label: 'Bronze Multiplier', type: 'number', step: '0.1' },
            { key: 'silver_multiplier', label: 'Silver Multiplier', type: 'number', step: '0.1' },
            { key: 'gold_multiplier', label: 'Gold Multiplier', type: 'number', step: '0.1' },
            { key: 'platinum_multiplier', label: 'Platinum Multiplier', type: 'number', step: '0.1' }
          ]}
          isDark={isDark}
        />
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '10px',
              color: isDark ? '#cbd5e1' : '#64748b',
              background: isDark ? '#334155' : 'white'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            style={{
              flex: 1,
              padding: '6px 12px',
              background: '#FF8C00',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '10px'
            }}
          >
            <FiSave style={{ marginRight: '6px', fontSize: '12px' }} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, userDetails, loading, onClose, onRefresh, onAdjustPoints, adjustForm, setAdjustForm, isDark }) => {
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showLifetimeSpendForm, setShowLifetimeSpendForm] = useState(false);
  const [lifetimeSpendValue, setLifetimeSpendValue] = useState('');
  const [updatingSpend, setUpdatingSpend] = useState(false);
  const modalBg = isDark ? '#1e293b' : 'white';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#475569' : '#e2e8f0';
  
  const handleUpdateLifetimeSpend = async () => {
    if (!lifetimeSpendValue || parseFloat(lifetimeSpendValue) < 0) {
      toast.error('Please enter a valid lifetime spend amount');
      return;
    }
    
    setUpdatingSpend(true);
    try {
      const response = await apiClient.post('/rewards-v2/admin/update-lifetime-spend', {
        user_id: user.id,
        lifetime_spend: parseFloat(lifetimeSpendValue)
      });
      
      toast.success(`Lifetime spend updated! Tier: ${response.data.user_tier.toUpperCase()}${response.data.tier_upgraded ? ' (UPGRADED!)' : ''}`);
      setLifetimeSpendValue('');
      setShowLifetimeSpendForm(false);
      
      // Refresh user details
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating lifetime spend:', error);
      toast.error(error.response?.data?.error || 'Failed to update lifetime spend');
    } finally {
      setUpdatingSpend(false);
    }
  };
  
  return (
    <div 
      className="modal" 
      onClick={onClose} 
      style={{ 
        background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)', 
        position: 'fixed', 
        inset: 0, 
        zIndex: 1000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: modalBg,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          border: isDark ? '1px solid #334155' : 'none',
          color: textColor,
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              {user.full_name || user.email}'s Rewards Details
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiX style={{ fontSize: '24px', color: '#64748b' }} />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading user details...</p>
          </div>
        ) : userDetails ? (
          <div style={{ padding: '24px' }}>
            {/* Reward Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <SummaryCard 
                title="Available Points"
                value={userDetails.balance?.available_points || 0}
                color="#FF8C00"
              />
              <SummaryCard 
                title="Points Earned"
                value={userDetails.balance?.points_earned || 0}
                color="#10b981"
              />
              <SummaryCard 
                title="Points Used"
                value={userDetails.balance?.points_used || 0}
                color="#f59e0b"
              />
              <SummaryCard 
                title="Points Expired"
                value={userDetails.balance?.points_expired || 0}
                color="#ef4444"
              />
            </div>
            
            {/* User Info & Actions */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>User Tier</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    {userDetails.balance?.user_tier ? userDetails.balance.user_tier.toUpperCase() : 'BRONZE'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Lifetime Spend</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                    ₹{userDetails.balance?.lifetime_spend ? userDetails.balance.lifetime_spend.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
              
              {/* Tier Criteria Info */}
              <div style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '13px',
                color: '#1e40af'
              }}>
                <strong>💡 Tier Criteria:</strong> Bronze (₹0) → Silver (₹5,000) → Gold (₹15,000) → Platinum (₹50,000)
              </div>
              
              {/* Update Lifetime Spend Button */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => {
                    setShowLifetimeSpendForm(!showLifetimeSpendForm);
                    setLifetimeSpendValue(userDetails.balance?.lifetime_spend?.toString() || '0');
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiDollarSign /> Update Lifetime Spend (Test Tier Upgrade)
                </button>
              </div>
              
              {/* Update Lifetime Spend Form */}
              {showLifetimeSpendForm && (
                <div style={{ background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>Update Lifetime Spend</h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                        Lifetime Spend (₹)
                      </label>
                      <input
                        type="number"
                        value={lifetimeSpendValue}
                        onChange={(e) => setLifetimeSpendValue(e.target.value)}
                        placeholder="Enter total lifetime spend amount"
                        min="0"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Set this to test tier upgrades. User tier will be automatically updated based on thresholds.
                      </p>
                    </div>
                    <button
                      onClick={handleUpdateLifetimeSpend}
                      disabled={!lifetimeSpendValue || updatingSpend}
                      style={{
                        padding: '10px 20px',
                        background: updatingSpend || !lifetimeSpendValue ? '#e2e8f0' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: updatingSpend || !lifetimeSpendValue ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      {updatingSpend ? 'Updating...' : 'Update & Check Tier'}
                    </button>
                  </div>
                </div>
              )}
              
              {userDetails.balance?.expiring_soon_count > 0 && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#d97706',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '16px'
                }}>
                  ⚠️ {userDetails.balance.expiring_soon_count} points expiring soon
                </div>
              )}
              
              <button
                onClick={() => setShowAdjustForm(!showAdjustForm)}
                style={{
                  padding: '10px 20px',
                  background: '#FF8C00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiEdit /> Adjust Points
              </button>
            </div>
            
            {/* Adjust Points Form */}
            {showAdjustForm && (
              <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>Adjust Points</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                      Points Adjustment (+/-)
                    </label>
                    <input
                      type="number"
                      value={adjustForm.points_delta}
                      onChange={(e) => setAdjustForm({ ...adjustForm, points_delta: e.target.value })}
                      placeholder="Enter points to add (positive) or deduct (negative)"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                      Reason
                    </label>
                    <textarea
                      value={adjustForm.reason}
                      onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                      placeholder="Enter reason for this adjustment..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <button
                    onClick={onAdjustPoints}
                    disabled={!adjustForm.points_delta || !adjustForm.reason}
                    style={{
                      padding: '10px 20px',
                      background: adjustForm.points_delta && adjustForm.reason ? '#FF8C00' : '#e2e8f0',
                      color: adjustForm.points_delta && adjustForm.reason ? 'white' : '#94a3b8',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: adjustForm.points_delta && adjustForm.reason ? 'pointer' : 'not-allowed',
                      fontWeight: '600'
                    }}
                  >
                    Apply Adjustment
                  </button>
                </div>
              </div>
            )}
            
            {/* Transaction History */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>Transaction History</h3>
              {userDetails.transactions && userDetails.transactions.length > 0 ? (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Order</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Points</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.transactions.slice(0, 10).map((transaction) => {
                        const transDate = transaction.date || transaction.created_at;
                        const transType = transaction.type || transaction.transaction_type || 'unknown';
                        const isEarned = transType === 'earned' || transType === 'admin_adjust';
                        const isDeducted = transType === 'redeemed' || transType === 'used' || transType === 'expired';
                        
                        // For deducted transactions, ensure negative value is shown with minus sign
                        // Backend stores negative values for used/redeemed, so respect that
                        let displayPoints = transaction.points;
                        if (isDeducted) {
                          // If points are already negative, use as-is; otherwise make negative
                          displayPoints = transaction.points < 0 ? transaction.points : -Math.abs(transaction.points);
                        } else {
                          // For earned, ensure positive
                          displayPoints = Math.abs(transaction.points);
                        }
                        
                        return (
                          <tr key={transaction.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                              {transDate ? new Date(transDate).toLocaleDateString() : '-'}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                              {user.full_name || user.email}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: isEarned ? '#dcfce7' : '#fee2e2',
                                color: isEarned ? '#16a34a' : '#dc2626'
                              }}>
                                {transType === 'used' ? 'Used' : transType}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                              {transaction.order_id || transaction.reference_id || '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: isEarned ? '#10b981' : '#ef4444', fontSize: '14px' }}>
                              {displayPoints !== 0 && (displayPoints > 0 ? '+' : '')}{displayPoints}
                            </td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>
                              {transaction.description || transaction.remarks || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No transaction history yet</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, color }) => (
  <div style={{
    background: 'white',
    border: '1px solid #e2e8f0',
    padding: '16px',
    borderRadius: '12px'
  }}>
    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>{title}</p>
    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0, color }}>{value.toLocaleString()}</p>
  </div>
);

// Tier Modal Component - COMPREHENSIVE VERSION WITH ALL FIELDS
const TierModal = ({ tier, onClose, onSave, isDark }) => {
  const parsePerks = (perksData) => {
    if (!perksData) return [];
    if (Array.isArray(perksData)) return perksData;
    try {
      return JSON.parse(perksData);
    } catch {
      return [];
    }
  };
  
  const [formData, setFormData] = useState({
    tier_name: tier?.tier_name || 'bronze',
    min_lifetime_spend: tier?.min_lifetime_spend || 0,
    points_multiplier: tier?.points_multiplier || 1.0,
    points_earning_rate_multiplier: tier?.points_earning_rate_multiplier !== undefined ? tier.points_earning_rate_multiplier : 1.0,
    perks: parsePerks(tier?.perks),
    badge_color: tier?.badge_color || '#gray',
    free_shipping_threshold: tier?.free_shipping_threshold !== undefined && tier.free_shipping_threshold !== null ? tier.free_shipping_threshold : '',
    priority_support: tier?.priority_support !== undefined ? tier.priority_support : false,
    early_access: tier?.early_access !== undefined ? tier.early_access : false,
    display_order: tier?.display_order !== undefined ? tier.display_order : 0,
    is_active: tier?.is_active !== undefined ? tier.is_active : true
  });
  
  const [newPerk, setNewPerk] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  
  const addPerk = () => {
    if (newPerk.trim()) {
      setFormData(prev => ({ ...prev, perks: [...prev.perks, newPerk.trim()] }));
      setNewPerk('');
    }
  };
  
  const removePerk = (index) => {
    setFormData(prev => ({ ...prev, perks: prev.perks.filter((_, i) => i !== index) }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        perks: JSON.stringify(formData.perks),
        free_shipping_threshold: formData.free_shipping_threshold === '' ? null : (formData.free_shipping_threshold ? parseFloat(formData.free_shipping_threshold) : null),
        min_lifetime_spend: parseFloat(formData.min_lifetime_spend) || 0,
        points_multiplier: parseFloat(formData.points_multiplier) || 1.0,
        points_earning_rate_multiplier: parseFloat(formData.points_earning_rate_multiplier) || 1.0,
        display_order: parseInt(formData.display_order) || 0
      };
      
      if (tier) {
        await apiClient.put(`/api/rewards/tiers/${tier.id}`, data);
      } else {
        await apiClient.post('/api/rewards/tiers', data);
      }
      toast.success(tier ? 'Tier updated successfully!' : 'Tier created successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error(error.response?.data?.error || 'Failed to save tier');
    } finally {
      setSaving(false);
    }
  };

  const modalBg = '#ffffff';
  const textColor = '#1e293b';
  const borderColor = '#e2e8f0';
  const inputBg = '#ffffff';
  
  return (
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        color: textColor
      }}>
        <div style={{ padding: '24px', borderBottom: `1px solid ${borderColor}`, background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: textColor }}>{tier ? 'Edit Tier' : 'Create New Tier'}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiX style={{ fontSize: '24px', color: '#64748b' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 14px', background: '#ffffff' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px' }}>
            {[{ id: 'basic', label: 'Basic Info', icon: '📝' }, { id: 'benefits', label: 'Benefits & Perks', icon: '🎁' }, { id: 'advanced', label: 'Advanced', icon: '⚙️' }].map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '6px 12px',
                  background: activeSection === section.id ? '#FF8C00' : 'transparent',
                  color: activeSection === section.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {activeSection === 'basic' && (
              <div style={{ 
                padding: '12px 14px', 
                background: '#ffffff', 
                borderRadius: '8px',
                border: `1px solid ${borderColor}`
              }}>
                <h3 style={{ fontSize: '11px', fontWeight: '700', marginBottom: '10px', color: '#FF8C00' }}>📝 Tier Details</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: textColor }}>Tier Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      name="tier_name"
                      value={formData.tier_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier_name: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '4px 8px', border: `2px solid ${borderColor}`, borderRadius: '6px', fontSize: '9px', background: inputBg, color: textColor }}
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Minimum Lifetime Spend (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="number"
                      name="min_lifetime_spend"
                      value={formData.min_lifetime_spend}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_lifetime_spend: e.target.value }))}
                      required
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Total amount customer must spend to reach this tier</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Points Multiplier</label>
                      <input
                        type="number"
                        name="points_multiplier"
                        value={formData.points_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, points_multiplier: e.target.value }))}
                        step="0.1"
                        min="0.1"
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Earning Rate Multiplier</label>
                      <input
                        type="number"
                        name="points_earning_rate_multiplier"
                        value={formData.points_earning_rate_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, points_earning_rate_multiplier: e.target.value }))}
                        step="0.1"
                        min="0.1"
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Badge Color</label>
                    <input
                      type="color"
                      name="badge_color"
                      value={formData.badge_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge_color: e.target.value }))}
                      style={{ width: '100%', height: '50px', border: `2px solid ${borderColor}`, borderRadius: '8px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'benefits' && (
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#8b5cf6' }}>🎁 Benefits & Perks</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Perks (JSON Array)</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        value={newPerk}
                        onChange={(e) => setNewPerk(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                        placeholder="Add a perk (e.g., Free Shipping)"
                        style={{ flex: 1, padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                      <button type="button" onClick={addPerk} style={{ padding: '12px 20px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px', background: '#ffffff', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                      {formData.perks.map((perk, idx) => (
                        <span key={idx} style={{ padding: '8px 16px', background: '#e0e7ff', color: '#6366f1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {perk}
                          <button type="button" onClick={() => removePerk(idx)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '18px' }}><FiX /></button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      name="free_shipping_threshold"
                      value={formData.free_shipping_threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, free_shipping_threshold: e.target.value }))}
                      step="0.01"
                      min="0"
                      placeholder="Leave empty for no free shipping"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                  </div>

                  <div style={{ padding: '16px', background: '#ffffff', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: textColor }}>Special Benefits</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.priority_support ? '#22c55e' : borderColor}` }}>
                        <input type="checkbox" checked={formData.priority_support} onChange={(e) => setFormData(prev => ({ ...prev, priority_support: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Priority Support</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.early_access ? '#8b5cf6' : borderColor}` }}>
                        <input type="checkbox" checked={formData.early_access} onChange={(e) => setFormData(prev => ({ ...prev, early_access: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#8b5cf6' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Early Access to New Products</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#10b981' }}>⚙️ Advanced Settings</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#ffffff', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Display Order</label>
                        <input
                          type="number"
                          name="display_order"
                          value={formData.display_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
                          min="0"
                          style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Status</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.is_active ? '#22c55e' : borderColor}` }}>
                          <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Active</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${borderColor}` }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiSave /> {saving ? 'Saving...' : (tier ? 'Update Tier' : 'Create Tier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Campaign Modal Component - COMPREHENSIVE VERSION WITH ALL 13 FIELDS
const CampaignModal = ({ campaign, tiers, onClose, onSave, isDark }) => {
  const parseApplicableTiers = (tiersData) => {
    if (!tiersData) return [];
    if (Array.isArray(tiersData)) return tiersData;
    try {
      return JSON.parse(tiersData);
    } catch {
      if (typeof tiersData === 'string') {
        return tiersData.split(',').map(t => t.trim()).filter(Boolean);
      }
      return [];
    }
  };

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    campaign_type: campaign?.campaign_type || 'multiplier',
    bonus_multiplier: campaign?.bonus_multiplier || '',
    bonus_points: campaign?.bonus_points || '',
    min_purchase_amount: campaign?.min_purchase_amount || 0,
    applicable_tiers: parseApplicableTiers(campaign?.applicable_tiers),
    valid_from: campaign?.valid_from ? new Date(campaign.valid_from).toISOString().split('T')[0] : '',
    valid_until: campaign?.valid_until ? new Date(campaign.valid_until).toISOString().split('T')[0] : '',
    is_active: campaign?.is_active !== undefined ? campaign.is_active : true,
    priority: campaign?.priority || 0,
    stackable: campaign?.stackable !== undefined ? campaign.stackable : false,
    max_uses_per_user: campaign?.max_uses_per_user || '',
    auto_apply: campaign?.auto_apply !== undefined ? campaign.auto_apply : false
  });

  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const toggleTier = (tier) => {
    setFormData(prev => ({
      ...prev,
      applicable_tiers: prev.applicable_tiers.includes(tier)
        ? prev.applicable_tiers.filter(t => t !== tier)
        : [...prev.applicable_tiers, tier]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        campaign_type: formData.campaign_type,
        bonus_multiplier: formData.bonus_multiplier ? parseFloat(formData.bonus_multiplier) : null,
        bonus_points: formData.bonus_points ? parseInt(formData.bonus_points) : null,
        min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
        applicable_tiers: formData.applicable_tiers,
        valid_from: formData.valid_from ? (formData.valid_from + 'T00:00:00Z') : null,
        valid_until: formData.valid_until ? (formData.valid_until + 'T23:59:59Z') : null,
        is_active: formData.is_active,
        priority: parseInt(formData.priority) || 0,
        stackable: formData.stackable,
        max_uses_per_user: formData.max_uses_per_user ? parseInt(formData.max_uses_per_user) : null,
        auto_apply: formData.auto_apply
      };

      if (campaign) {
        await apiClient.put(`/api/rewards/campaigns/${campaign.id}`, data);
      } else {
        await apiClient.post('/api/rewards/campaigns', data);
      }
      toast.success(campaign ? 'Campaign updated successfully!' : 'Campaign created successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(error.response?.data?.error || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const modalBg = '#ffffff';
  const textColor = '#1e293b';
  const borderColor = '#e2e8f0';
  const inputBg = '#ffffff';

  return (
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: textColor }}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${borderColor}`, background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: textColor }}>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiX style={{ fontSize: '18px', color: '#64748b' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 14px', background: '#ffffff' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px' }}>
            {[{ id: 'basic', label: 'Basic Info', icon: '📝' }, { id: 'targeting', label: 'Targeting & Rules', icon: '🎯' }, { id: 'advanced', label: 'Advanced', icon: '⚙️' }].map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '6px 12px',
                  background: activeSection === section.id ? '#FF8C00' : 'transparent',
                  color: activeSection === section.id ? 'white' : '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {activeSection === 'basic' && (
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#FF8C00' }}>📝 Campaign Details</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Campaign Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., Double Rewards Weekend"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      placeholder="Describe this campaign..."
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Campaign Type <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      name="campaign_type"
                      value={formData.campaign_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, campaign_type: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    >
                      <option value="multiplier">Multiplier</option>
                      <option value="bonus_points">Bonus Points</option>
                      <option value="cashback">Cashback</option>
                      <option value="signup_bonus">Signup Bonus</option>
                      <option value="birthday_bonus">Birthday Bonus</option>
                      <option value="double_points">Double Points</option>
                    </select>
                  </div>

                  {formData.campaign_type === 'multiplier' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Bonus Multiplier</label>
                      <input
                        type="number"
                        name="bonus_multiplier"
                        value={formData.bonus_multiplier}
                        onChange={(e) => setFormData(prev => ({ ...prev, bonus_multiplier: e.target.value }))}
                        step="0.1"
                        min="0.1"
                        placeholder="e.g., 2.0 for double points"
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>
                  )}

                  {formData.campaign_type === 'bonus_points' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Bonus Points</label>
                      <input
                        type="number"
                        name="bonus_points"
                        value={formData.bonus_points}
                        onChange={(e) => setFormData(prev => ({ ...prev, bonus_points: e.target.value }))}
                        min="1"
                        placeholder="e.g., 100"
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Valid From <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="date"
                        name="valid_from"
                        value={formData.valid_from}
                        onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Valid Until <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="date"
                        name="valid_until"
                        value={formData.valid_until}
                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                        required
                        min={formData.valid_from || new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'targeting' && (
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#8b5cf6' }}>🎯 Targeting & Eligibility Rules</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Minimum Purchase Amount (₹)</label>
                    <input
                      type="number"
                      name="min_purchase_amount"
                      value={formData.min_purchase_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_purchase_amount: e.target.value }))}
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Minimum order amount required for this campaign to apply</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Applicable Tiers</label>
                    <div style={{ padding: '16px', background: '#ffffff', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
                          const isSelected = formData.applicable_tiers.includes(tier);
                          return (
                            <label key={tier} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 20px', borderRadius: '10px', background: '#ffffff', border: `2px solid ${isSelected ? '#FF8C00' : borderColor}`, textTransform: 'capitalize', fontWeight: isSelected ? '700' : '600' }}>
                              <input type="checkbox" checked={isSelected} onChange={() => toggleTier(tier)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#FF8C00' }} />
                              <span style={{ fontSize: '14px', color: textColor }}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>Select which customer tiers this campaign applies to. Leave all unchecked for all tiers.</p>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Max Uses Per User</label>
                    <input
                      type="number"
                      name="max_uses_per_user"
                      value={formData.max_uses_per_user}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_uses_per_user: e.target.value }))}
                      min="1"
                      placeholder="Leave empty for unlimited"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Maximum number of times a single user can use this campaign</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#10b981' }}>⚙️ Advanced Settings</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Priority</label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      min="0"
                      placeholder="Higher number = higher priority"
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>When multiple campaigns apply, higher priority wins</p>
                  </div>

                  <div style={{ padding: '16px', background: '#ffffff', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: textColor }}>Campaign Behavior Options</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.is_active ? '#22c55e' : borderColor}` }}>
                        <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Active</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.stackable ? '#8b5cf6' : borderColor}` }}>
                        <input type="checkbox" checked={formData.stackable} onChange={(e) => setFormData(prev => ({ ...prev, stackable: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#8b5cf6' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Stackable (can combine with other campaigns)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', background: '#ffffff', border: `1px solid ${formData.auto_apply ? '#FF8C00' : borderColor}` }}>
                        <input type="checkbox" checked={formData.auto_apply} onChange={(e) => setFormData(prev => ({ ...prev, auto_apply: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#FF8C00' }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>Auto-Apply (automatically applied when conditions are met)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${borderColor}` }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiSave /> {saving ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Test Tab Component
const TestTab = ({ users, onRefresh, isDark }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [testOrderAmount, setTestOrderAmount] = useState('1000');
  const [testPointsToUse, setTestPointsToUse] = useState('0');
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [conversionRate, setConversionRate] = useState(0.1);
  const [testCouponCode, setTestCouponCode] = useState('');
  const [testRewardPoints, setTestRewardPoints] = useState('0');
  const [stackingTestResult, setStackingTestResult] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [testOrderData, setTestOrderData] = useState({
    orderAmount: '1000',
    couponCode: '',
    rewardPointsToUse: '0',
    subtotal: '1000'
  });
  const [orderTestResult, setOrderTestResult] = useState(null);

  useEffect(() => {
    fetchConversionRate();
    fetchCampaigns();
    fetchCoupons();
  }, []);

  const fetchCampaigns = async (showToast = false) => {
    try {
      const response = await apiClient.get('/api/rewards/campaigns', {
        suppressErrorToast: !showToast // Show toast only if explicitly requested
      });
      setCampaigns(response.data.campaigns || []);
      if (showToast && response.data.campaigns?.length > 0) {
        toast.success(`Loaded ${response.data.campaigns.length} campaigns`);
      }
      return true;
    } catch (error) {
      // Silently handle 401 errors - don't show session expired for background fetches
      if (error.response?.status === 401) {
        if (showToast) {
          toast.error('Authentication required. Please login to load campaigns.');
        } else {
          console.warn('[Test Tab] Campaigns fetch requires authentication');
        }
      } else {
        if (showToast) {
          toast.error('Failed to load campaigns: ' + (error.response?.data?.error || error.message));
        } else {
          console.error('Error fetching campaigns:', error);
        }
      }
      setCampaigns([]);
      return false;
    }
  };

  const fetchCoupons = async (showToast = false) => {
    try {
      const response = await apiClient.get('/api/coupons', {
        suppressErrorToast: !showToast // Show toast only if explicitly requested
      });
      setCoupons(response.data.coupons || []);
      if (showToast && response.data.coupons?.length > 0) {
        toast.success(`Loaded ${response.data.coupons.length} coupons`);
      }
      return true;
    } catch (error) {
      // Silently handle 401 errors - don't show session expired for background fetches
      if (error.response?.status === 401) {
        if (showToast) {
          toast.error('Authentication required. Please login to load coupons.');
        } else {
          console.warn('[Test Tab] Coupons fetch requires authentication');
        }
      } else {
        if (showToast) {
          toast.error('Failed to load coupons: ' + (error.response?.data?.error || error.message));
        } else {
          console.error('Error fetching coupons:', error);
        }
      }
      setCoupons([]);
      return false;
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await apiClient.get('/api/rewards/settings', {
        suppressErrorToast: true // Don't show error toast for background fetch
      });
      if (response.data?.settings) {
        const rate = response.data.settings.points_to_currency_rate?.value || 
                    response.data.settings.conversion_rate?.value || 0.1;
        setConversionRate(parseFloat(rate));
      }
    } catch (error) {
      // Silently handle 401 errors - don't show session expired for background fetches
      if (error.response?.status === 401) {
        console.warn('[Test Tab] Conversion rate fetch requires authentication');
      } else {
        console.error('Error fetching conversion rate:', error);
      }
      // Keep default conversion rate
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await apiClient.get(`/rewards-v2/user/${userId}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleTestOrderPayment = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    const orderAmount = parseFloat(testOrderAmount);
    if (!orderAmount || orderAmount <= 0) {
      toast.error('Please enter a valid order amount');
      return;
    }

    setLoading(true);
    try {
      const expectedPoints = Math.round((orderAmount / 1000) * 100);
      
      const response = await apiClient.post(`/rewards-v2/test/order-payment`, {
        user_id: selectedUser.id,
        order_amount: orderAmount,
        order_number: `TEST-${Date.now()}`
      });

      if (response.data.success) {
        toast.success(`Order payment processed! ${expectedPoints} reward points granted.`);
        setTestResults({
          orderAmount,
          pointsGranted: expectedPoints,
          currencyValue: (expectedPoints * conversionRate).toFixed(2),
          timestamp: new Date().toISOString()
        });
        
        await fetchUserDetails(selectedUser.id);
        await onRefresh();
      }
    } catch (error) {
      console.error('Error testing order payment:', error);
      toast.error(error.response?.data?.error || 'Failed to process test order payment');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPointsUsage = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    const pointsToUse = parseInt(testPointsToUse);
    if (!pointsToUse || pointsToUse <= 0) {
      toast.error('Please enter a valid number of points to use');
      return;
    }

    if (!userDetails || userDetails.balance.available_points < pointsToUse) {
      toast.error('User does not have enough points');
      return;
    }

    setLoading(true);
    try {
      const currencyValue = (pointsToUse * conversionRate).toFixed(2);
      
      const response = await apiClient.post(`/rewards-v2/test/use-points`, {
        user_id: selectedUser.id,
        points: pointsToUse,
        order_number: `TEST-USE-${Date.now()}`
      });

      if (response.data.success) {
        toast.success(`Used ${pointsToUse} points (₹${currencyValue}) successfully!`);
        setTestResults({
          pointsUsed: pointsToUse,
          currencyValue,
          timestamp: new Date().toISOString()
        });
        
        await fetchUserDetails(selectedUser.id);
        await onRefresh();
      }
    } catch (error) {
      console.error('Error testing points usage:', error);
      toast.error(error.response?.data?.error || 'Failed to use points');
    } finally {
      setLoading(false);
    }
  };

  const handleTestTierUpgrade = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const testAmounts = [5000, 15000, 50000];
      const currentSpend = userDetails?.balance?.lifetime_spend || 0;
      const nextTierAmount = testAmounts.find(amt => amt > currentSpend) || 50000;
      
      const response = await apiClient.post('/rewards-v2/admin/update-lifetime-spend', {
        user_id: selectedUser.id,
        lifetime_spend: nextTierAmount
      });

      if (response.data.success) {
        toast.success(`Lifetime spend updated to ₹${nextTierAmount}. Tier should upgrade automatically!`);
        await fetchUserDetails(selectedUser.id);
        await onRefresh();
      }
    } catch (error) {
      console.error('Error testing tier upgrade:', error);
      toast.error(error.response?.data?.error || 'Failed to test tier upgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleTestStacking = async () => {
    const couponCode = testCouponCode?.trim();
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }

    const points = parseInt(testRewardPoints) || 0;
    if (points === 0) {
      toast.error('Please enter reward points greater than 0 to test stacking');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/reward-stacking/test-stacking', {
        coupon_code: couponCode,
        reward_points_used: points
      });

      setStackingTestResult(response.data);
      if (response.data.can_stack) {
        toast.success('Stacking is allowed!');
      } else {
        toast.error(response.data.message || 'Stacking is not allowed');
      }
    } catch (error) {
      console.error('Error testing stacking:', error);
      toast.error(error.response?.data?.error || 'Failed to test stacking');
      setStackingTestResult({ can_stack: false, error: error.response?.data?.error || 'Failed to test stacking' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestOrderCreation = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }

    const orderAmount = parseFloat(testOrderData.orderAmount);
    const rewardPointsToUse = parseInt(testOrderData.rewardPointsToUse) || 0;
    const couponCode = testOrderData.couponCode.trim();

    if (!orderAmount || orderAmount <= 0) {
      toast.error('Please enter a valid order amount');
      return;
    }

    // Validate stacking if both coupon and points are used
    if (couponCode && rewardPointsToUse > 0) {
      try {
        const stackingResponse = await apiClient.post('/reward-stacking/test-stacking', {
          coupon_code: couponCode,
          reward_points_used: rewardPointsToUse
        });

        if (!stackingResponse.data.can_stack) {
          toast.error(stackingResponse.data.message || 'Cannot combine coupon with reward points');
          setOrderTestResult({
            success: false,
            error: stackingResponse.data.message || 'Stacking not allowed'
          });
          return;
        }
      } catch (error) {
        toast.error('Error validating stacking: ' + (error.response?.data?.error || error.message));
        return;
      }
    }

    setLoading(true);
    try {
      // Calculate discount from reward points
      const rewardDiscount = rewardPointsToUse * conversionRate;
      const finalAmount = Math.max(0, orderAmount - rewardDiscount);

      // Try to get a real product, or use null for test orders
      let productId = null;
      try {
        const productsResponse = await apiClient.get('/api/products?per_page=1', { suppressErrorToast: true });
        if (productsResponse.data?.products?.length > 0) {
          productId = productsResponse.data.products[0].id;
        }
      } catch (error) {
        console.warn('Could not fetch products, using null product_id for test order');
      }

      const orderData = {
        user_id: selectedUser.id,
        status: 'pending',
        subtotal: orderAmount,
        total_amount: finalAmount,
        coupon_code: couponCode || null,
        coupon_discount: 0, // Will be calculated by backend if coupon is valid
        reward_points_used: rewardPointsToUse,
        payment_status: 'paid', // Set to paid to trigger reward point granting
        currency: 'INR',
        items: [{
          product_id: productId, // Will be null if no products exist, backend will handle it
          product_name: 'Test Product',
          quantity: 1,
          unit_price: orderAmount,
          total_price: orderAmount
        }]
      };

      const response = await apiClient.post('/api/orders/', orderData);

      if (response.data.order_id) {
        // Use coupon_discount from initial response if available, otherwise fetch order
        let couponDiscount = response.data.coupon_discount || 0;
        let finalAmount = response.data.total_amount || finalAmount;
        let pointsGranted = 0;
        let appliedCampaigns = [];
        
        // Fetch the created order to get actual calculated values
        try {
          const orderResponse = await apiClient.get(`/api/orders/${response.data.order_id}`);
          // Backend returns order data nested under 'order' key
          const createdOrder = orderResponse.data.order || orderResponse.data;
          
          console.log('[Test Order] Full order response:', orderResponse.data);
          console.log('[Test Order] Created order object:', createdOrder);
          console.log('[Test Order] Coupon discount from order:', createdOrder.coupon_discount);
          
          // Use fetched values if available
          couponDiscount = createdOrder.coupon_discount || couponDiscount;
          finalAmount = createdOrder.total_amount || finalAmount;
          pointsGranted = createdOrder.reward_points_granted || 0;
          appliedCampaigns = createdOrder.applied_campaigns || [];
        } catch (fetchError) {
          console.error('[Test Order] Error fetching order details:', fetchError);
          // Use values from initial response
        }
        
        toast.success(`Order created successfully! Order #${response.data.order_number}`);
        setOrderTestResult({
          success: true,
          order_id: response.data.order_id,
          order_number: response.data.order_number,
          order_amount: orderAmount,
          coupon_code: couponCode,
          coupon_discount: couponDiscount,
          reward_points_used: rewardPointsToUse,
          reward_discount: rewardDiscount,
          final_amount: finalAmount,
          points_granted: pointsGranted,
          applied_campaigns: appliedCampaigns
        });
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('[Test Order] Error creating order:', error);
      toast.error(error.response?.data?.error || 'Failed to create test order');
      setOrderTestResult({
        success: false,
        error: error.response?.data?.error || 'Failed to create test order'
      });
    } finally {
      setLoading(false);
    }
  };

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const bgColor = isDark ? '#1e293b' : 'white';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const cardBg = isDark ? '#1e293b' : 'white';

  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by trying to fetch user details
    const checkAuth = async () => {
      if (users && users.length > 0) {
        setAuthError(false);
      } else {
        // If no users available, might be auth issue
        try {
          await apiClient.get('/api/rewards/settings', { suppressErrorToast: true });
          setAuthError(false);
        } catch (error) {
          if (error.response?.status === 401) {
            setAuthError(true);
          }
        }
      }
    };
    checkAuth();
  }, [users]);

  return (
    <div style={{ padding: '24px', background: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: textColor }}>
          🧪 Reward System Test Center
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
          Test all reward functionality: automatic point granting, tier upgrades, and point-to-currency conversion
        </p>
        
        {(authError || coupons.length === 0) && (
          <div style={{ 
            padding: '16px', 
            background: coupons.length === 0 ? '#fef3c7' : '#dbeafe', 
            borderRadius: '8px', 
            border: `1px solid ${coupons.length === 0 ? '#f59e0b' : '#3b82f6'}`,
            marginBottom: '24px'
          }}>
            {coupons.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                ⚠️ <strong>Coupons not loaded:</strong> You can still test by entering coupon codes manually in the input fields. Click the "🔄 Refresh" button next to coupon fields to try loading again (requires login).
              </p>
            ) : (
              <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                ℹ️ <strong>Note:</strong> Some features require authentication. If you see errors, please ensure you're logged in.
              </p>
            )}
          </div>
        )}

        <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>Select User</h3>
          <select
            value={selectedUser?.id || ''}
            onChange={(e) => {
              const user = users.find(u => u.id === parseInt(e.target.value));
              setSelectedUser(user);
              if (user) {
                fetchUserDetails(user.id);
              }
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${borderColor}`,
              borderRadius: '8px',
              fontSize: '14px',
              background: isDark ? '#334155' : 'white',
              color: textColor
            }}
          >
            <option value="">-- Select a user --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} - {user.reward_points || 0} points - {(user.reward_balance?.user_tier || 'bronze').toUpperCase()} tier
              </option>
            ))}
          </select>

          {userDetails && (
            <div style={{ marginTop: '20px', padding: '16px', background: isDark ? '#334155' : '#f8fafc', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: textColor }}>Current Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Available Points:</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#FF8C00' }}>{userDetails.balance.available_points}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Points Value:</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>₹{(userDetails.balance.available_points * conversionRate).toFixed(2)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Current Tier:</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#8b5cf6', textTransform: 'capitalize' }}>{userDetails.balance.user_tier}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Lifetime Spend:</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>₹{userDetails.balance.lifetime_spend?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>💰 Test Order Payment</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Simulate order payment to test automatic reward point granting.<br />
              Formula: (Order Amount ÷ 1000) × 100 points
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Order Amount (₹)</label>
              <input
                type="number"
                value={testOrderAmount}
                onChange={(e) => setTestOrderAmount(e.target.value)}
                placeholder="1000"
                min="1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: isDark ? '#334155' : 'white',
                  color: textColor
                }}
              />
              {testOrderAmount && (
                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                  Will grant: {Math.round((parseFloat(testOrderAmount) / 1000) * 100)} points
                </p>
              )}
            </div>
            <button
              onClick={handleTestOrderPayment}
              disabled={loading || !selectedUser}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !selectedUser ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !selectedUser ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Processing...' : 'Test Order Payment'}
            </button>
          </div>

          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>💸 Test Points Usage</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Test converting reward points to currency and using them in an order.<br />
              Conversion Rate: 1 point = ₹{conversionRate}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Points to Use</label>
              <input
                type="number"
                value={testPointsToUse}
                onChange={(e) => setTestPointsToUse(e.target.value)}
                placeholder="100"
                min="1"
                max={userDetails?.balance?.available_points || 0}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: isDark ? '#334155' : 'white',
                  color: textColor
                }}
              />
              {testPointsToUse && (
                <p style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>
                  Currency value: ₹{(parseInt(testPointsToUse) * conversionRate).toFixed(2)}
                </p>
              )}
            </div>
            <button
              onClick={handleTestPointsUsage}
              disabled={loading || !selectedUser || !testPointsToUse || parseInt(testPointsToUse) <= 0}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !selectedUser || !testPointsToUse ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !selectedUser || !testPointsToUse ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Processing...' : 'Test Points Usage'}
            </button>
          </div>

          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>⭐ Test Tier Upgrade</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Test automatic tier upgrade by updating lifetime spend.<br />
              Thresholds: Silver ₹5,000 | Gold ₹15,000 | Platinum ₹50,000
            </p>
            <button
              onClick={handleTestTierUpgrade}
              disabled={loading || !selectedUser}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !selectedUser ? '#94a3b8' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !selectedUser ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Processing...' : 'Test Tier Upgrade'}
            </button>
          </div>

          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>🔗 Test Stacking (Coupon + Reward Points)</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Test if a coupon can be combined with reward points.<br />
              Some coupons allow stacking, others don't.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: textColor }}>Coupon Code *</label>
                <button
                  type="button"
                  onClick={() => fetchCoupons(true)}
                  style={{
                    padding: '4px 12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              {coupons.length > 0 ? (
                <select
                  value={testCouponCode}
                  onChange={(e) => setTestCouponCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: isDark ? '#334155' : 'white',
                    color: textColor
                  }}
                >
                  <option value="">-- Select Coupon --</option>
                  {coupons.filter(c => c.is_active && (!c.valid_until || new Date(c.valid_until) >= new Date())).map(coupon => (
                    <option key={coupon.id} value={coupon.code}>
                      {coupon.code} {coupon.can_combine_with_reward_points ? '(✓ Can stack)' : '(✗ Cannot stack)'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={testCouponCode}
                  onChange={(e) => setTestCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code manually (e.g., SAVE2U2JAPI6)"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: isDark ? '#334155' : 'white',
                    color: textColor
                  }}
                />
              )}
              {coupons.length === 0 && (
                <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠️ Coupons not loaded. Enter coupon code manually or click Refresh to load from server.
                </p>
              )}
              {testCouponCode && coupons.find(c => c.code === testCouponCode) && (
                <p style={{ fontSize: '12px', color: coupons.find(c => c.code === testCouponCode)?.can_combine_with_reward_points ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                  {coupons.find(c => c.code === testCouponCode)?.can_combine_with_reward_points 
                    ? '✓ This coupon allows stacking with reward points' 
                    : '✗ This coupon does NOT allow stacking with reward points'}
                </p>
              )}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Reward Points to Use</label>
              <input
                type="number"
                value={testRewardPoints}
                onChange={(e) => setTestRewardPoints(e.target.value)}
                placeholder="100"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: isDark ? '#334155' : 'white',
                  color: textColor
                }}
              />
            </div>
            <button
              onClick={handleTestStacking}
              disabled={loading || !testCouponCode || parseInt(testRewardPoints) === 0}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !testCouponCode || parseInt(testRewardPoints) === 0 ? '#94a3b8' : '#FF8C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !testCouponCode || parseInt(testRewardPoints) === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Testing...' : 'Test Stacking'}
            </button>
            {stackingTestResult && (
              <div style={{ marginTop: '16px', padding: '12px', background: stackingTestResult.can_stack ? '#d1fae5' : '#fee2e2', borderRadius: '8px', border: `1px solid ${stackingTestResult.can_stack ? '#10b981' : '#ef4444'}` }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: stackingTestResult.can_stack ? '#065f46' : '#991b1b', margin: 0 }}>
                  {stackingTestResult.can_stack ? '✅ Stacking Allowed' : '❌ Stacking Not Allowed'}
                </p>
                <p style={{ fontSize: '12px', color: stackingTestResult.can_stack ? '#047857' : '#dc2626', marginTop: '4px', marginBottom: 0 }}>
                  {stackingTestResult.message || stackingTestResult.error}
                </p>
              </div>
            )}
          </div>

          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: textColor }}>🎯 Active Campaigns</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                  View campaigns that would apply to orders. Campaigns are automatically applied during order processing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchCampaigns(true)}
                style={{
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                🔄 Refresh
              </button>
            </div>
            {(() => {
              const activeCampaigns = campaigns.filter(c => {
                if (!c.is_active) return false;
                
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                // Parse dates - handle both date strings and datetime strings
                let validFrom = c.valid_from ? new Date(c.valid_from) : null;
                let validUntil = c.valid_until ? new Date(c.valid_until) : null;
                
                if (validFrom) {
                  validFrom = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate());
                }
                if (validUntil) {
                  validUntil = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate());
                }
                
                // Check if campaign is within valid date range
                const isWithinDateRange = (!validFrom || today >= validFrom) && (!validUntil || today <= validUntil);
                
                return isWithinDateRange;
              });
              
              return activeCampaigns.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  {campaigns.length === 0 ? 'No campaigns loaded' : 'No active campaigns (check dates and active status)'}
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '12px', maxHeight: '400px', overflow: 'auto' }}>
                  {activeCampaigns.map(campaign => (
                  <div key={campaign.id} style={{ padding: '12px', background: isDark ? '#334155' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: textColor, margin: 0 }}>{campaign.name}</h4>
                      <span style={{ fontSize: '12px', padding: '4px 8px', background: '#22c55e', color: 'white', borderRadius: '4px', fontWeight: '600' }}>ACTIVE</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>{campaign.description}</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', background: '#e0e7ff', color: '#6366f1', borderRadius: '4px' }}>
                        {campaign.campaign_type === 'multiplier' ? `${campaign.bonus_multiplier || campaign.multiplier_value || 1}× Multiplier` :
                         campaign.campaign_type === 'bonus_points' ? `${campaign.bonus_points || 0} Bonus Points` :
                         campaign.campaign_type.charAt(0).toUpperCase() + campaign.campaign_type.slice(1)}
                      </span>
                      {campaign.min_purchase_amount > 0 && (
                        <span style={{ fontSize: '12px', padding: '4px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '4px' }}>
                          Min: ₹{campaign.min_purchase_amount}
                        </span>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div style={{ background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}`, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>🛒 Test Order Creation (Full Flow)</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
              Create a test order with coupon and/or reward points. This will test the complete flow including stacking validation and campaign application.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Order Amount (₹) *</label>
                <input
                  type="number"
                  value={testOrderData.orderAmount}
                  onChange={(e) => setTestOrderData({...testOrderData, orderAmount: e.target.value, subtotal: e.target.value})}
                  placeholder="1000"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: isDark ? '#334155' : 'white',
                    color: textColor
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: textColor }}>Coupon Code</label>
                  <button
                    type="button"
                    onClick={() => fetchCoupons(true)}
                    style={{
                      padding: '4px 12px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
                {coupons.length > 0 ? (
                  <select
                    value={testOrderData.couponCode}
                    onChange={(e) => setTestOrderData({...testOrderData, couponCode: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: isDark ? '#334155' : 'white',
                      color: textColor
                    }}
                  >
                    <option value="">-- No Coupon --</option>
                    {coupons.filter(c => c.is_active && (!c.valid_until || new Date(c.valid_until) >= new Date())).map(coupon => (
                      <option key={coupon.id} value={coupon.code}>
                        {coupon.code} - {coupon.can_combine_with_reward_points ? '✓ Can stack' : '✗ Cannot stack'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={testOrderData.couponCode}
                    onChange={(e) => setTestOrderData({...testOrderData, couponCode: e.target.value.toUpperCase()})}
                    placeholder="Enter coupon code manually (e.g., SAVE2U2JAPI6)"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: isDark ? '#334155' : 'white',
                      color: textColor
                    }}
                  />
                )}
                {coupons.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                    ⚠️ Enter coupon code manually or click Refresh to load from server.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Reward Points to Use</label>
                <input
                  type="number"
                  value={testOrderData.rewardPointsToUse}
                  onChange={(e) => setTestOrderData({...testOrderData, rewardPointsToUse: e.target.value})}
                  placeholder="0"
                  min="0"
                  max={userDetails?.balance?.available_points || 0}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: isDark ? '#334155' : 'white',
                    color: textColor
                  }}
                />
                {testOrderData.rewardPointsToUse && parseInt(testOrderData.rewardPointsToUse) > 0 && (
                  <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                    Discount: ₹{(parseInt(testOrderData.rewardPointsToUse) * conversionRate).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {testOrderData.couponCode && parseInt(testOrderData.rewardPointsToUse) > 0 && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                  ⚠️ Testing stacking: Coupon "{testOrderData.couponCode}" + {testOrderData.rewardPointsToUse} reward points
                </p>
              </div>
            )}

            <button
              onClick={handleTestOrderCreation}
              disabled={loading || !selectedUser || !testOrderData.orderAmount}
              style={{
                width: '100%',
                padding: '12px',
                background: loading || !selectedUser || !testOrderData.orderAmount ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !selectedUser || !testOrderData.orderAmount ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              {loading ? 'Creating Order...' : 'Create Test Order'}
            </button>

            {orderTestResult && (
              <div style={{ marginTop: '16px', padding: '16px', background: orderTestResult.success ? '#d1fae5' : '#fee2e2', borderRadius: '8px', border: `1px solid ${orderTestResult.success ? '#10b981' : '#ef4444'}` }}>
                {orderTestResult.success ? (
                  <>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', margin: '0 0 8px 0' }}>
                      ✅ Order Created Successfully!
                    </p>
                    <div style={{ fontSize: '12px', color: '#047857' }}>
                      <p style={{ margin: '4px 0' }}><strong>Order Number:</strong> {orderTestResult.order_number}</p>
                      <p style={{ margin: '4px 0' }}><strong>Order Amount:</strong> ₹{orderTestResult.order_amount?.toFixed(2)}</p>
                      {orderTestResult.coupon_code && (
                        <>
                          <p style={{ margin: '4px 0' }}><strong>Coupon:</strong> {orderTestResult.coupon_code}</p>
                          <p style={{ margin: '4px 0', color: orderTestResult.coupon_discount > 0 ? '#10b981' : '#ef4444' }}>
                            <strong>Coupon Discount:</strong> {orderTestResult.coupon_discount > 0 ? `-₹${orderTestResult.coupon_discount?.toFixed(2)}` : '₹0.00 (Not applied - check coupon validity)'}
                          </p>
                        </>
                      )}
                      {orderTestResult.reward_points_used > 0 && (
                        <>
                          <p style={{ margin: '4px 0' }}><strong>Reward Points Used:</strong> {orderTestResult.reward_points_used}</p>
                          <p style={{ margin: '4px 0', color: '#10b981' }}><strong>Reward Discount:</strong> -₹{orderTestResult.reward_discount?.toFixed(2)}</p>
                        </>
                      )}
                      <p style={{ margin: '8px 0 4px 0', fontSize: '14px', fontWeight: '600', paddingTop: '8px', borderTop: '1px solid #10b981' }}>
                        <strong>Final Amount:</strong> ₹{orderTestResult.final_amount?.toFixed(2)}
                      </p>
                      {orderTestResult.points_granted > 0 && (
                        <>
                          <p style={{ margin: '8px 0 0 0', color: '#FF8C00', fontWeight: '600', fontSize: '13px' }}>
                            ✨ <strong>Reward Points Granted:</strong> {orderTestResult.points_granted} points
                          </p>
                          {orderTestResult.applied_campaigns && orderTestResult.applied_campaigns.length > 0 && (
                            <div style={{ margin: '8px 0 0 0', padding: '8px', backgroundColor: '#fff7ed', borderRadius: '4px', fontSize: '12px' }}>
                              <strong style={{ color: '#ea580c' }}>Applied Campaigns:</strong>
                              {orderTestResult.applied_campaigns.map((campaign, idx) => (
                                <div key={idx} style={{ marginTop: '4px', color: '#9a3412' }}>
                                  • {campaign.name} ({campaign.type})
                                  {campaign.multiplier > 1 && ` - ${campaign.multiplier}x multiplier`}
                                  {campaign.bonus_points > 0 && ` - +${campaign.bonus_points} bonus points`}
                                </div>
                              ))}
                              <p style={{ marginTop: '4px', fontSize: '11px', color: '#7c2d12' }}>
                                Base points: {Math.round(orderTestResult.order_amount / 10)} points (₹{orderTestResult.order_amount} ÷ 1000 × 100)
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: 0 }}>
                    ❌ {orderTestResult.error || 'Failed to create order'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {testResults && (
          <div style={{ marginTop: '24px', background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>📊 Test Results</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {testResults.orderAmount && (
                <div style={{ padding: '12px', background: isDark ? '#334155' : '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: textColor }}>Order Amount:</strong> ₹{testResults.orderAmount.toFixed(2)}
                  <br />
                  <strong style={{ color: textColor }}>Points Granted:</strong> {testResults.pointsGranted}
                  <br />
                  <strong style={{ color: textColor }}>Currency Value:</strong> ₹{testResults.currencyValue}
                </div>
              )}
              {testResults.pointsUsed && (
                <div style={{ padding: '12px', background: isDark ? '#334155' : '#f8fafc', borderRadius: '8px' }}>
                  <strong style={{ color: textColor }}>Points Used:</strong> {testResults.pointsUsed}
                  <br />
                  <strong style={{ color: textColor }}>Currency Value:</strong> ₹{testResults.currencyValue}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Test completed at: {new Date(testResults.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '32px', background: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: textColor }}>📖 How It Works</h3>
          <div style={{ display: 'grid', gap: '16px', fontSize: '14px', color: textColor }}>
            <div>
              <strong style={{ color: '#10b981' }}>1. Automatic Reward Point Granting:</strong>
              <p style={{ marginTop: '4px', color: '#64748b' }}>
                When an order payment is processed, reward points are automatically granted based on order amount.
                Formula: (Order Amount ÷ 1000) × 100 points. Example: ₹1000 order = 100 points, ₹2000 = 200 points.
              </p>
            </div>
            <div>
              <strong style={{ color: '#3b82f6' }}>2. Points to Currency Conversion:</strong>
              <p style={{ marginTop: '4px', color: '#64748b' }}>
                Reward points can be converted to currency at the rate of 1 point = ₹{conversionRate}.
                Users can use these points as discount when placing orders.
              </p>
            </div>
            <div>
              <strong style={{ color: '#8b5cf6' }}>3. Tier Upgrades:</strong>
              <p style={{ marginTop: '4px', color: '#64748b' }}>
                User tiers are automatically upgraded based on lifetime spend:
                Bronze (₹0) → Silver (₹5,000) → Gold (₹15,000) → Platinum (₹50,000).
                Tier upgrades happen automatically when lifetime spend threshold is reached.
              </p>
            </div>
            <div>
              <strong style={{ color: '#FF8C00' }}>4. Transaction Logging:</strong>
              <p style={{ marginTop: '4px', color: '#64748b' }}>
                All reward transactions (earned, used, adjusted) are logged in the reward_transactions table
                with complete details including reference order, points, balance after, and timestamp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsManagementV2;

