import React, { useState, useEffect } from 'react';
import { 
  FiAward, FiUsers, FiTrendingUp, FiClock, FiSettings, FiSave, FiX,
  FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiBarChart2, FiZap
} from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const RewardsAdvanced = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview stats
  const [stats, setStats] = useState({
    totalIssued: 0,
    totalRedeemed: 0,
    totalExpired: 0,
    activeUsers: 0
  });
  
  // Tiers
  const [tiers, setTiers] = useState([]);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  
  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  // Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    signup_bonus: '100',
    spend_threshold: '100',
    points_per_threshold: '10',
    conversion_rate: '0.10',
    max_usage_percent: '10',
    expiry_days: '180'
  });
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'tiers') {
        await fetchTiers();
      } else if (activeTab === 'campaigns') {
        await fetchCampaigns();
      } else if (activeTab === 'overview') {
        await Promise.all([fetchStats(), fetchTiers(), fetchCampaigns()]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/rewards/user/summary');
      // This is user-specific, we need admin stats endpoint
      // For now, use a placeholder
      setStats({
        totalIssued: 0,
        totalRedeemed: 0,
        totalExpired: 0,
        activeUsers: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const fetchTiers = async () => {
    try {
      const response = await apiClient.get('/api/rewards/tiers');
      setTiers(response.data.tiers || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Failed to load tiers');
    }
  };
  
  const fetchCampaigns = async () => {
    try {
      const response = await apiClient.get('/api/rewards/campaigns');
      setCampaigns(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };
  
  const fetchSettings = async () => {
    try {
      const response = await apiClient.get('/api/rewards/settings');
      if (response.data.settings) {
        const fetchedSettings = {};
        Object.keys(response.data.settings).forEach(key => {
          fetchedSettings[key] = response.data.settings[key].value || settings[key];
        });
        setSettings(prev => ({ ...prev, ...fetchedSettings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      const settingsData = {};
      Object.keys(settings).forEach(key => {
        settingsData[key] = { value: settings[key] };
      });
      await apiClient.put('/api/rewards/settings', settingsData);
      toast.success('Settings saved successfully!');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };
  
  const handleDeleteTier = async (tierId) => {
    if (window.confirm('Are you sure you want to delete this tier?')) {
      try {
        await apiClient.delete(`/api/rewards/tiers/${tierId}`);
        toast.success('Tier deleted successfully!');
        fetchTiers();
      } catch (error) {
        console.error('Error deleting tier:', error);
        toast.error('Failed to delete tier');
      }
    }
  };
  
  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await apiClient.delete(`/api/rewards/campaigns/${campaignId}`);
        toast.success('Campaign deleted successfully!');
        fetchCampaigns();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };
  
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
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)'
    }
  };
  
  if (loading) {
    return (
      <div style={themeStyles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container" style={{ ...themeStyles.container, padding: '0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', color: '#1e293b' }}>Advanced Reward Management</h1>
        <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>Comprehensive control over tiers, campaigns, and reward settings</p>
      </div>
      
      {/* Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          {['overview', 'tiers', 'campaigns', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: activeTab === tab ? '#FF8C00' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
          <div style={themeStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Points Issued</span>
              <FiAward style={{ fontSize: '24px', color: '#FF8C00' }} />
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1e293b' }}>{stats.totalIssued.toLocaleString()}</h3>
          </div>
          
          <div style={themeStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total Redeemed</span>
              <FiTrendingUp style={{ fontSize: '24px', color: '#10b981' }} />
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1e293b' }}>{stats.totalRedeemed.toLocaleString()}</h3>
          </div>
          
          <div style={themeStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Points Expired</span>
              <FiClock style={{ fontSize: '24px', color: '#f59e0b' }} />
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1e293b' }}>{stats.totalExpired.toLocaleString()}</h3>
          </div>
          
          <div style={themeStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Active Users</span>
              <FiUsers style={{ fontSize: '24px', color: '#8b5cf6' }} />
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: '#1e293b' }}>{stats.activeUsers.toLocaleString()}</h3>
          </div>
        </div>
      )}
      
      {activeTab === 'tiers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Reward Tiers</h2>
            <button
              onClick={() => {
                setEditingTier(null);
                setShowTierModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#FF8C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <FiPlus /> Create Tier
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {tiers.map(tier => (
              <div key={tier.id} style={themeStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#1e293b', textTransform: 'capitalize' }}>
                      {tier.tier_name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px 0' }}>
                      Min Spend: ₹{parseFloat(tier.min_lifetime_spend || 0).toLocaleString()} | 
                      Multiplier: {tier.points_multiplier}x
                    </p>
                    {tier.perks && Array.isArray(tier.perks) && tier.perks.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {tier.perks.map((perk, idx) => (
                          <span key={idx} style={{ padding: '4px 12px', background: '#e0e7ff', color: '#6366f1', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                            {perk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingTier(tier);
                        setShowTierModal(true);
                      }}
                      style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#1e293b' }}
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      style={{ padding: '8px 12px', border: '1px solid #fee2e2', background: '#fee2e2', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#dc2626' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Reward Campaigns</h2>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setShowCampaignModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#FF8C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <FiPlus /> Create Campaign
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {campaigns.map(campaign => (
              <div key={campaign.id} style={themeStyles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', color: '#1e293b' }}>
                      {campaign.name}
                      {campaign.is_active && (
                        <span style={{ marginLeft: '12px', padding: '4px 12px', background: '#22c55e', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          ACTIVE
                        </span>
                      )}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px 0' }}>
                      {campaign.description || 'No description'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                      <span>Type: {campaign.campaign_type}</span>
                      {campaign.bonus_multiplier && <span>Multiplier: {campaign.bonus_multiplier}x</span>}
                      {campaign.bonus_points && <span>Bonus: {campaign.bonus_points} pts</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingCampaign(campaign);
                        setShowCampaignModal(true);
                      }}
                      style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#1e293b' }}
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      style={{ padding: '8px 12px', border: '1px solid #fee2e2', background: '#fee2e2', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#dc2626' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Reward Settings</h2>
            <button
              onClick={() => {
                fetchSettings();
                setShowSettingsModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#FF8C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <FiSettings /> Edit Settings
            </button>
          </div>
          
          <div style={themeStyles.card}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {Object.keys(settings).map(key => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', textTransform: 'replace', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{settings[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Tier Modal - Use the same TierModal from RewardsManagementV2 */}
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
      
      {/* Campaign Modal - Use the same CampaignModal from RewardsManagementV2 */}
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
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
          isDark={isDark}
        />
      )}
    </div>
  );
};

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
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        color: textColor
      }}>
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${borderColor}`, background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: textColor }}>{tier ? 'Edit Tier' : 'Create New Tier'}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiX style={{ fontSize: '18px', color: '#64748b' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: `2px solid ${borderColor}`, paddingBottom: '12px' }}>
            {[{ id: 'basic', label: 'Basic Info', icon: '📝' }, { id: 'benefits', label: 'Benefits & Perks', icon: '🎁' }, { id: 'advanced', label: 'Advanced', icon: '⚙️' }].map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '10px 20px',
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
              <div style={{ 
                padding: '20px', 
                background: '#ffffff', 
                borderRadius: '12px',
                border: `1px solid ${borderColor}`
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#FF8C00' }}>📝 Tier Details</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: textColor }}>Tier Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      name="tier_name"
                      value={formData.tier_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, tier_name: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '12px 16px', border: `2px solid ${borderColor}`, borderRadius: '8px', fontSize: '14px', background: inputBg, color: textColor }}
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

const SettingsModal = ({ settings, setSettings, onClose, onSave, isDark }) => {
  return (
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '8px', padding: '12px 14px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', margin: 0, color: '#1e293b' }}>Reward Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX style={{ fontSize: '18px', color: '#64748b' }} />
          </button>
        </div>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {Object.keys(settings).map(key => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: '#1e293b', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={settings[key]}
                onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
                style={{ width: '100%', padding: '4px 8px', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '9px', background: '#ffffff', color: '#1e293b' }}
              />
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px' }}>
            Cancel
          </button>
          <button onClick={onSave} style={{ flex: 1, padding: '12px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FiSave /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsAdvanced;

