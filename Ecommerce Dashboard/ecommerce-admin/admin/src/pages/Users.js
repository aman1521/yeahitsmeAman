import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiDownload,
  FiPlus,  
  FiSave,
  FiX,
  FiArrowDown,
  FiList
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import ActionsDropdown from '../components/ActionsDropdown';
import SearchBar from '../components/SearchBar';

const Users = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country_code: '',
    preferred_currency: 'INR',
    wallet_balance: 0,
    reward_points: 0,
    is_active: true,
    email_verified: false
  });
  const searchTimeout = useRef(null);

  const getRewardPoints = (user) => {
    return Math.max(
      user?.reward_balance?.available_points ??
        user?.reward_points ??
        0,
      0
    );
  };

  const getCountryName = (countryCode) => {
    // If no country code provided, return N/A
    if (!countryCode || countryCode === 'N/A' || countryCode === '') {
      return 'N/A';
    }
    
    // If countries haven't loaded yet, return the code as fallback
    if (!countries || countries.length === 0) {
      console.warn('[Customers] Countries not loaded yet, showing code:', countryCode);
      return countryCode;
    }
    
    // Try to find the country by various field names
    const country = countries.find(c => 
      c.country_code === countryCode || 
      c.code === countryCode ||
      c.iso_code === countryCode ||
      c.country_code?.toUpperCase() === countryCode?.toUpperCase()
    );
    
    if (country) {
      return country.country_name || country.name || countryCode;
    }
    
    // Debug: Log if country not found
    console.warn('[Customers] Country not found for code:', countryCode, 'Total countries loaded:', countries.length);
    if (countries.length > 0) {
      console.log('[Customers] Sample countries:', countries.slice(0, 3).map(c => ({
        code: c.country_code || c.code,
        name: c.country_name || c.name
      })));
    }
    
    // Return the code as fallback instead of N/A
    return countryCode;
  };

  // Read search from URL (global search bar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      setDebouncedSearch(searchParam);
      console.log('[Customers] Search from URL:', searchParam);
    }
  }, [location.search]);

  // Update debounced search immediately when searchTerm changes (on Enter press)
  useEffect(() => {
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, isActiveFilter, sortBy, sortOrder, perPage]);

  useEffect(() => {
    fetchCountriesAndCurrencies();
  }, []);

  const fetchCountriesAndCurrencies = async () => {
    try {
      const { fetchCountriesAndCurrencies: fetchUtil } = await import('../utils/countryCurrencyUtils');
      const { countries, currencies } = await fetchUtil(false); // exclude inactive
      
      setCountries(countries);
      setCurrencies(currencies);
      console.log(`[Customers] Loaded ${countries.length} unique countries and ${currencies.length} currencies`);
    } catch (error) {
      console.error('Error fetching countries/currencies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        role: 'customer'  // Only show customers by default
      };

      // Only add search param if search term is not empty
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }

      // Only add is_active filter if not "all"
      if (isActiveFilter !== 'all') {
        params.is_active = isActiveFilter === 'active';
      }

      const response = await apiClient.get('/users/', { params });

      const usersData = response.data.users || [];
      setUsers(usersData);
      setTotalPages(response.data.pages || 1);
      
      console.log('[Customers] Loaded:', usersData.length, 'users');
      // Debug: Check user data structure for country field
      if (usersData.length > 0) {
        const firstUser = usersData[0];
        const countryFields = Object.keys(firstUser).filter(k => k.toLowerCase().includes('countr'));
        console.log('[Customers] DEBUG - User country data:', {
          user_id: firstUser.id,
          email: firstUser.email,
          country_code: firstUser.country_code,
          country: firstUser.country,
          country_name: firstUser.country_name,
          country_id: firstUser.country_id,
          foundFields: countryFields,
          allKeys: Object.keys(firstUser).slice(0, 10) // First 10 keys
        });
        console.log('[Customers] DEBUG - Countries loaded:', countries.length);
        if (countries.length > 0) {
          console.log('[Customers] DEBUG - Sample country:', countries[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setCurrentPage(1);
    console.log('[Customers] Items per page:', e.target.value);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    console.log('[Customers] Viewing user:', user.email);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await apiClient.put(`/users/${userId}/status`, { 
        is_active: !currentStatus 
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const backfillCountryCodes = async () => {
    if (!window.confirm('This will update all users with null/empty country codes to "IND". Continue?')) {
      return;
    }
    
    try {
      const response = await apiClient.post('/users/backfill-country-codes');
      if (response.data.success) {
        toast.success(response.data.message || `Updated ${response.data.updated_count || 0} users`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error backfilling country codes:', error);
      toast.error(error.response?.data?.error || 'Failed to backfill country codes');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      if (editingUser) {
        // Update existing user
        await apiClient.put(`/users/${editingUser.id}`, {
          ...formData,
          reward_points: Math.max(formData.reward_points || 0, 0)
        });
        toast.success('User updated successfully!');
      } else {
        // Create new user
        await apiClient.post('/users/', {
          ...formData,
          reward_points: Math.max(formData.reward_points || 0, 0)
        });
        toast.success('User created successfully!');
      }

      setShowAddForm(false);
      setEditingUser(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        country_code: '',
        preferred_currency: 'INR',
        wallet_balance: 0,
        reward_points: 0,
        is_active: true,
        email_verified: false
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      country_code: user.country_code || 'IND',
      preferred_currency: user.preferred_currency || 'INR',
      wallet_balance: user.wallet_balance || 0,
      reward_points: 0,
      is_active: user.is_active,
      email_verified: user.email_verified || false
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      country_code: 'IND',
      preferred_currency: 'INR',
      wallet_balance: 0,
      reward_points: 0,
      is_active: true,
      email_verified: false
    });
  };

  const downloadCustomerReport = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await apiClient.get('/reports/customers/export', {
        responseType: 'blob',
        params: {
          sort_by: sortBy,
          sort_order: sortOrder,
          search: debouncedSearch || '',
          is_active: isActiveFilter !== 'all' ? isActiveFilter : undefined
        }
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `customers_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Customer report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading customer report:', error);
      toast.error('Failed to download customer report');
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
        {isActive ? 'Active' : 'Blocked'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      admin: 'status-active',
      staff: 'status-processing',
      user: 'status-pending'
    };
    
    return (
      <span className={`status-badge ${roleClasses[role] || 'status-pending'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '2px', lineHeight: '1.3' }}>Customers</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0, lineHeight: '1.4' }}>Manage customer accounts, wallet balances, and reward points</p>
      </div>

        {/* Filters next to title */}
        <div className="page-header-actions" style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          alignItems: 'center', 
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Filter by Status */}
          <div className="filter-chip" style={{ 
            padding: '4px 10px', 
            gap: '6px', 
            borderRadius: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            minHeight: '24px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Filter</label>
            <select 
              className="form-select filter-select"
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setCurrentPage(1);
                console.log('[Customers] Filter:', e.target.value);
              }}
              style={{ 
                fontSize: '8px',
                minWidth: '110px',
                padding: '0 18px 0 4px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Customers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Blocked Only</option>
            </select>
          </div>
          
          {/* Sort By */}
          <div className="filter-chip" style={{ 
            padding: '4px 10px', 
            gap: '6px', 
            borderRadius: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            minHeight: '24px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Sort By</label>
            <select 
              className="form-select filter-select"
              value={sortBy}
              onChange={(e) => {
                const newSort = e.target.value;
                setSortBy(newSort);
                setCurrentPage(1);
                console.log('[Customers] Sort by:', newSort);
              }}
              style={{ 
                fontSize: '8px',
                minWidth: '120px',
                padding: '0 18px 0 4px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="created_at">Recently Added</option>
              <option value="wallet_balance">Wallet Balance</option>
              <option value="reward_points">Reward Points</option>
            </select>
          </div>
          
          {/* Items Per Page */}
          <div className="filter-chip" style={{ 
            padding: '4px 10px', 
            gap: '6px', 
            borderRadius: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s ease',
            minHeight: '24px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Per Page</label>
            <select 
              className="form-select filter-select"
              value={perPage}
              onChange={handlePerPageChange}
              style={{ 
                fontSize: '8px',
                minWidth: '60px',
                padding: '0 18px 0 4px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          {/* Add Customer Button */}
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar Below Header */}
      <div style={{ marginBottom: '8px' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);
          }}
          placeholder="Search customers..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Add/Edit Customer Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '8px' }}>
          <div className="card-header">
            <h3 className="card-title">
              {editingUser ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCancel}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <FiX />
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* Left Column */}
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Country</label>
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.country_code} value={country.country_code}>
                        {country.country_name} ({country.country_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Preferred Currency</label>
                  <select
                    name="preferred_currency"
                    value={formData.preferred_currency}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Wallet Balance</label>
                  <input
                    type="number"
                    name="wallet_balance"
                    value={formData.wallet_balance}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="form-label">Reward Points</label>
                  <input
                    type="number"
                    name="reward_points"
                    value={formData.reward_points}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    Active User
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="email_verified"
                      checked={formData.email_verified}
                      onChange={handleChange}
                    />
                    Email Verified
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              padding: '8px', 
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                style={{ 
                  background: '#8b5cf6', 
                  color: 'white',
                  padding: '4px 8px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  padding: '4px 8px' 
                }}
              >
                <FiSave />
                {editingUser ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" />
              </th>
              <th>CUSTOMER</th>
              <th>EMAIL</th>
              <th>PHONE</th>
              <th>COUNTRY</th>
              <th>WALLET</th>
              <th>POINTS</th>
              <th>STATUS</th>
              <th style={{ width: '80px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '11px', color: '#64748b' }}>
                  {debouncedSearch ? 'No customers found matching your search.' : 'No customers yet.'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span style={{ fontWeight: '500' }}>
                        {user.full_name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: '#64748b' }}>{user.email}</td>
                  <td style={{ color: '#64748b' }}>{user.phone || 'N/A'}</td>
                  <td>
                    <span style={{ color: '#64748b', fontSize: '9px' }}>
                      {getCountryName(user.country_code || user.country || user.country_name || user.country_id)}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', color: '#10b981' }}>
                    {user.preferred_currency} {parseFloat(user.wallet_balance || 0).toFixed(2)}
                  </td>
                  <td style={{ fontWeight: '600', color: '#f59e0b' }}>
                    {getRewardPoints(user)} {getRewardPoints(user) === 1 ? 'point' : 'points'}
                  </td>
                  <td>{getStatusBadge(user.is_active)}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <ActionsDropdown
                        onView={() => handleViewUser(user)}
                        onEdit={() => handleEdit(user)}
                        onToggleStatus={() => toggleUserStatus(user.id, user.is_active)}
                        isActive={user.is_active}
                        viewLabel="View Details"
                        editLabel="Edit Customer"
                        statusLabel={user.is_active ? 'Block Customer' : 'Activate Customer'}
                        itemName="customer"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '13px',
          gap: '10px'
        }}>
          <button 
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button 
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="card-header">
              <h3 className="card-title">Customer Details</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setViewingUser(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiX />
                Close
              </button>
            </div>
            
            <div style={{ padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>FULL NAME</label>
                  <p style={{ marginTop: '3px', fontSize: '9px' }}>{viewingUser.full_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>EMAIL</label>
                  <p style={{ marginTop: '3px', fontSize: '9px', color: '#ef4444' }}>{viewingUser.email}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>PHONE</label>
                  <p style={{ marginTop: '3px', fontSize: '9px' }}>{viewingUser.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>COUNTRY</label>
                  <p style={{ marginTop: '3px', fontSize: '9px' }}>{getCountryName(viewingUser.country_code)}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>PREFERRED CURRENCY</label>
                  <p style={{ marginTop: '3px', fontSize: '9px' }}>{viewingUser.preferred_currency || 'INR'}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>STATUS</label>
                  <p style={{ marginTop: '3px' }}>{getStatusBadge(viewingUser.is_active)}</p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>WALLET BALANCE</label>
                  <p style={{ marginTop: '3px', fontSize: '9px', fontWeight: '600', color: '#10b981' }}>
                    {viewingUser.preferred_currency} {parseFloat(viewingUser.wallet_balance || 0).toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>REWARD POINTS</label>
                  <p style={{ marginTop: '3px', fontSize: '9px', fontWeight: '600', color: '#f59e0b' }}>
                    {getRewardPoints(viewingUser)} points
                  </p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>EMAIL VERIFIED</label>
                  <p style={{ marginTop: '3px' }}>
                    {viewingUser.email_verified ? (
                      <span style={{ color: '#10b981' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>✗ Not Verified</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label style={{ fontWeight: '600', color: '#64748b', fontSize: '8px' }}>JOINED</label>
                  <p style={{ marginTop: '3px', fontSize: '9px' }}>
                    {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '13px', paddingTop: '13px', borderTop: '1px solid #e2e8f0' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setViewingUser(null);
                    handleEdit(viewingUser);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', justifyContent: 'center' }}
                >
                  <FiEdit />
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export CSV Button - Moved to bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '13px', marginBottom: '13px' }}>
        <button 
          className="btn btn-export-csv" 
          onClick={downloadCustomerReport}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', fontSize: '11px', fontWeight: '600' }}
        >
          <FiDownload />
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default Users;
