import React, { useState, useEffect } from 'react';
import { 
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiUser,
  FiTrendingUp,
  FiAward,
  FiDollarSign,
  FiClock,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiStar,
  FiSettings,
  FiSave
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const RewardsManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    points_delta: '',
    reason: ''
  });
  const [rewardsHistory, setRewardsHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [configs, setConfigs] = useState({});
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [configForm, setConfigForm] = useState({
    signup_bonus_points: '100',
    spending_threshold: '100',
    points_per_threshold: '10',
    points_to_currency_rate: '0.10',
    max_percentage_points_payment: '10',
    use_product_points: 'true'
  });
  const [stats, setStats] = useState({
    totalPoints: 0,
    activeMembers: 0,
    avgPoints: 0,
    topEarner: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setIsLoadingConfigs(true);
      const response = await apiClient.get('/rewards/config');
      if (response.data.configs) {
        setConfigs(response.data.configs);
        
        // Populate form with existing config values
        const formData = {};
        Object.keys(response.data.configs).forEach(key => {
          formData[key] = response.data.configs[key].value;
        });
        setConfigForm(prev => ({ ...prev, ...formData }));
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const saveConfigs = async () => {
    try {
      const configsArray = [
        { setting_key: 'signup_bonus_points', setting_value: configForm.signup_bonus_points, data_type: 'number', description: 'Reward points given to users when they sign up' },
        { setting_key: 'spending_threshold', setting_value: configForm.spending_threshold, data_type: 'number', description: 'Amount threshold (in currency) for earning reward points' },
        { setting_key: 'points_per_threshold', setting_value: configForm.points_per_threshold, data_type: 'number', description: 'Number of reward points earned per spending threshold' },
        { setting_key: 'points_to_currency_rate', setting_value: configForm.points_to_currency_rate, data_type: 'number', description: 'Conversion rate: 1 point = X currency units' },
        { setting_key: 'max_percentage_points_payment', setting_value: configForm.max_percentage_points_payment, data_type: 'number', description: 'Maximum percentage of order total that can be paid with reward points' },
        { setting_key: 'use_product_points', setting_value: configForm.use_product_points, data_type: 'boolean', description: 'Whether to use product-specific reward points if available' }
      ];
      
      await apiClient.post('/rewards/config/bulk', { configs: configsArray });
      toast.success('Reward configuration saved successfully!');
      setShowConfigModal(false);
      fetchConfigs();
    } catch (error) {
      console.error('Error saving configs:', error);
      toast.error(error.response?.data?.error || 'Failed to save configuration');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/');
      
      if (response.data && response.data.users) {
        const sortedUsers = response.data.users.sort((a, b) => (b.reward_points || 0) - (a.reward_points || 0));
        setUsers(sortedUsers);
        
        // Calculate stats
        const totalPoints = sortedUsers.reduce((sum, user) => sum + (user.reward_points || 0), 0);
        const avgPoints = sortedUsers.length > 0 ? Math.round(totalPoints / sortedUsers.length) : 0;
        const topEarner = sortedUsers.length > 0 ? sortedUsers[0].reward_points : 0;
        
        setStats({
          totalPoints,
          activeMembers: sortedUsers.length,
          avgPoints,
          topEarner
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }
    
    if (!adjustForm.points_delta || !adjustForm.reason) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await apiClient.post('/rewards/admin/adjust', {
        user_id: selectedUser.id,
        points_delta: parseInt(adjustForm.points_delta),
        reason: adjustForm.reason
      });

      toast.success(`Points adjusted: New balance ${response.data.reward_points}`);
      
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, reward_points: response.data.reward_points }
          : u
      ).sort((a, b) => (b.reward_points || 0) - (a.reward_points || 0));
      
      setUsers(updatedUsers);
      setSelectedUser({ ...selectedUser, reward_points: response.data.reward_points });
      setShowAdjustForm(false);
      setAdjustForm({ points_delta: '', reason: '' });
      
      // Update stats
      const totalPoints = updatedUsers.reduce((sum, user) => sum + (user.reward_points || 0), 0);
      const avgPoints = updatedUsers.length > 0 ? Math.round(totalPoints / updatedUsers.length) : 0;
      setStats({ ...stats, totalPoints, avgPoints });
      
      if (showHistoryModal) {
        fetchRewardsHistory(selectedUser.id);
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
      toast.error(error.response?.data?.error || 'Failed to adjust points');
    }
  };

  const fetchRewardsHistory = async (userId) => {
    try {
      setIsLoadingHistory(true);
      const response = await apiClient.get(`/rewards/history/${userId}`);
      setRewardsHistory(response.data.history || []);
    } catch (error) {
      console.error('Error fetching rewards history:', error);
      toast.error('Failed to load rewards history');
      setRewardsHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleViewHistory = (user) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
    fetchRewardsHistory(user.id);
  };

  // Filter by search term - empty search shows all
  const filteredUsers = users.filter(user => {
    // If search is empty, show all
    if (!searchTerm || searchTerm.trim() === '') return true;
    const search = searchTerm.toLowerCase().trim();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      String(user.id).includes(search) ||
      String(user.reward_points || '').includes(search)
    );
  });

  const topEarners = users.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto' }}></div>
          <p className="mt-4 text-gray-500">Loading rewards data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-page page-container">
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Rewards Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '400' }}>
              Monitor, manage and track customer loyalty rewards program
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowConfigModal(true)}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontWeight: '600'
              }}
            >
              <FiSettings /> Configuration
            </button>
            <button
              onClick={() => setShowAdjustForm(true)}
              disabled={!selectedUser}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontWeight: '600',
                opacity: selectedUser ? 1 : 0.5,
                cursor: selectedUser ? 'pointer' : 'not-allowed'
              }}
            >
              <FiPlus /> Adjust Points
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card rewards-kpi rewards-kpi--amber">
          <div className="rewards-kpi__content">
            <div>
              <p className="rewards-kpi__label">Total Points Issued</p>
              <p className="rewards-kpi__value">{stats.totalPoints.toLocaleString()}</p>
            </div>
            <div className="rewards-kpi__icon">
              <FiAward />
            </div>
          </div>
        </div>

        <div className="card rewards-kpi rewards-kpi--rose">
          <div className="rewards-kpi__content">
            <div>
              <p className="rewards-kpi__label">Active Members</p>
              <p className="rewards-kpi__value">{stats.activeMembers}</p>
            </div>
            <div className="rewards-kpi__icon">
              <FiUsers />
            </div>
          </div>
        </div>

        <div className="card rewards-kpi rewards-kpi--teal">
          <div className="rewards-kpi__content">
            <div>
              <p className="rewards-kpi__label">Average Points</p>
              <p className="rewards-kpi__value">{stats.avgPoints}</p>
            </div>
            <div className="rewards-kpi__icon">
              <FiTrendingUp />
            </div>
          </div>
        </div>

        <div className="card rewards-kpi rewards-kpi--violet">
          <div className="rewards-kpi__content">
            <div>
              <p className="rewards-kpi__label">Top Earner</p>
              <p className="rewards-kpi__value">{stats.topEarner}</p>
            </div>
            <div className="rewards-kpi__icon">
              <FiStar />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="card rewards-panel mb-6">
        <div style={{ padding: '20px' }}>
          <div className="flex items-center gap-4">
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '18px'
              }} />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '48px', 
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  border: '1px solid var(--input-border)',
                  borderRadius: '8px',
                  width: '100%',
                  fontSize: '14px',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={fetchUsers}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
          {searchTerm && (
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </div>
      </div>

      {/* Top Earners Section */}
      {topEarners.length > 0 && (
        <div className="card mb-6" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>Top 5 Earners</h3>
            <div className="space-y-3">
              {topEarners.map((user, index) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer hover:shadow-md"
                  style={{ 
                    border: '1px solid #e2e8f0',
                    background: index < 3 ? '#fef9c3' : 'white'
                  }}
                  onClick={() => handleViewHistory(user)}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#f59e0b' : '#e2e8f0',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}>
                      {index + 1}
                    </div>
                  <div>
                    <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.full_name || 'Guest User'}</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>Points</p>
                    <p style={{ fontWeight: '700', color: 'var(--color-primary-text)', fontSize: '18px', textAlign: 'right' }}>{user.reward_points || 0}</p>
                    </div>
                    <button
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewHistory(user);
                      }}
                      style={{ background: 'var(--color-primary)', color: 'var(--color-primary-text)', border: 'none' }}
                    >
                      View History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Users Table */}
      <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>All Members</h3>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <FiSearch style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '16px' }}>No users found matching your search.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>USER</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>EMAIL</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>REWARD POINTS</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '13px' }}>WALLET BALANCE</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '13px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="rewards-table-row"
                      style={{ 
                        cursor: 'pointer',
                        background: selectedUser?.id === user.id ? 'rgba(255,189,47,0.12)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {user.full_name || 'Guest User'}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontWeight: '700', 
                          color: 'var(--color-primary-text)',
                          padding: '6px 14px',
                          background: 'rgba(255,189,47,0.15)',
                          borderRadius: '20px',
                          fontSize: '13px',
                          display: 'inline-block'
                        }}>
                          {user.reward_points || 0} pts
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#10b981', fontWeight: '600' }}>
                        ₹{parseFloat(user.wallet_balance || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewHistory(user);
                          }}
                          style={{ 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: '500'
                          }}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Points Modal */}
      {showAdjustForm && (
        <div className="modal" onClick={() => setShowAdjustForm(false)} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '12px' }}>
            <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#1e293b' }}>Adjust Reward Points</h2>
              <button onClick={() => setShowAdjustForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX style={{ fontSize: '24px', color: '#64748b' }} />
              </button>
            </div>

            {selectedUser ? (
              <>
                <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Selected User</p>
                  <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                    {selectedUser.full_name || 'Guest User'}
                  </p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                    {selectedUser.email}
                  </p>
                  <div className="flex items-center gap-8">
                    <div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Current Balance</p>
                      <p style={{ fontWeight: '700', color: '#3b82f6', fontSize: '20px' }}>
                        {selectedUser.reward_points || 0} points
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Points Adjustment</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter points to add (positive) or deduct (negative)"
                    value={adjustForm.points_delta}
                    onChange={(e) => setAdjustForm({ ...adjustForm, points_delta: e.target.value })}
                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Positive number adds points, negative number deducts
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Reason</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Enter reason for this adjustment..."
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setShowAdjustForm(false);
                      setAdjustForm({ points_delta: '', reason: '' });
                    }}
                    style={{ padding: '12px', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleAdjustPoints}
                    disabled={!selectedUser || !adjustForm.points_delta || !adjustForm.reason}
                    style={{ 
                      padding: '12px', 
                      borderRadius: '8px',
                      opacity: (!selectedUser || !adjustForm.points_delta || !adjustForm.reason) ? 0.5 : 1,
                      cursor: (!selectedUser || !adjustForm.points_delta || !adjustForm.reason) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Apply Adjustment
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                <FiAlertCircle style={{ fontSize: '48px', marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', fontWeight: '600' }}>No User Selected</p>
                <p style={{ fontSize: '14px', color: '#64748b' }}>Please select a user from the table</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="modal" onClick={() => setShowHistoryModal(false)} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', borderRadius: '12px' }}>
            <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, marginBottom: '4px', color: '#1e293b' }}>
                  {selectedUser.full_name}'s Rewards History
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  {selectedUser.email} • Current Balance: <strong style={{ color: '#3b82f6' }}>{selectedUser.reward_points || 0} points</strong>
                </p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX style={{ fontSize: '24px', color: '#64748b' }} />
              </button>
            </div>

            {isLoadingHistory ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Loading history...</p>
              </div>
            ) : rewardsHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <FiClock style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontSize: '16px', fontWeight: '600' }}>No Transaction History</p>
                <p style={{ fontSize: '14px' }}>This user hasn't earned or redeemed any points yet.</p>
              </div>
            ) : (
              <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px' }}>DATE</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px' }}>TRANSACTION</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px' }}>ORDER ID</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '12px' }}>POINTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardsHistory.map((transaction) => (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '12px', color: '#1e293b', fontSize: '13px' }}>{transaction.reason || 'N/A'}</td>
                        <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{transaction.order_id || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: transaction.points_delta > 0 ? '#10b981' : '#ef4444', fontSize: '14px' }}>
                          {transaction.points_delta > 0 ? '+' : ''}{transaction.points_delta}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)} style={{ padding: '10px 20px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="modal" onClick={() => setShowConfigModal(false)} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', borderRadius: '12px' }}>
            <div className="flex items-center justify-between mb-6" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#1e293b' }}>Reward System Configuration</h2>
              <button onClick={() => setShowConfigModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX style={{ fontSize: '24px', color: '#64748b' }} />
              </button>
            </div>

            {isLoadingConfigs ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Loading configuration...</p>
              </div>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Signup Bonus Points</label>
                  <input
                    type="number"
                    className="form-input"
                    value={configForm.signup_bonus_points}
                    onChange={(e) => setConfigForm({ ...configForm, signup_bonus_points: e.target.value })}
                    placeholder="100"
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Points awarded when a new user signs up
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Spending Threshold (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={configForm.spending_threshold}
                    onChange={(e) => setConfigForm({ ...configForm, spending_threshold: e.target.value })}
                    placeholder="100"
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Users earn points for every ₹X spent
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Points Per Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    value={configForm.points_per_threshold}
                    onChange={(e) => setConfigForm({ ...configForm, points_per_threshold: e.target.value })}
                    placeholder="10"
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Number of points earned per spending threshold
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Point to Currency Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={configForm.points_to_currency_rate}
                    onChange={(e) => setConfigForm({ ...configForm, points_to_currency_rate: e.target.value })}
                    placeholder="0.10"
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Conversion rate (e.g., 1 point = ₹0.10)
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Max Points Payment (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={configForm.max_percentage_points_payment}
                    onChange={(e) => setConfigForm({ ...configForm, max_percentage_points_payment: e.target.value })}
                    placeholder="10"
                  />
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>
                    Maximum percentage of order total that can be paid with reward points
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={configForm.use_product_points === 'true'}
                      onChange={(e) => setConfigForm({ ...configForm, use_product_points: e.target.checked ? 'true' : 'false' })}
                    />
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>Use Product-Specific Reward Points</span>
                  </label>
                  <small style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', display: 'block', marginLeft: '28px' }}>
                    If enabled, products with specific reward points set will use those instead of calculated points
                  </small>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => setShowConfigModal(false)}
                    style={{ padding: '12px', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary flex-1"
                    onClick={saveConfigs}
                    style={{ padding: '12px', borderRadius: '8px' }}
                  >
                    <FiSave style={{ marginRight: '8px' }} />
                    Save Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsManagement;
