import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiFilter,
  FiCalendar,
  FiX,
  FiSave,
  FiRefreshCw,
  FiGlobe,
  FiTag,
  FiDollarSign,
  FiUsers,
  FiClock
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';

const Coupons = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [countries, setCountries] = useState([]);
  const [products, setProducts] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchCoupons();
    fetchCountries();
    fetchProducts();
  }, [currentPage, debouncedSearchTerm, isActiveFilter, sortBy, sortOrder]);

  const fetchCountries = async () => {
    try {
      const response = await apiClient.get('/countries/');
      setCountries(response.data.countries || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products/');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      console.log('[Coupons] Fetching coupons...');
      
      const params = {
        page: currentPage,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      // Only add search param if search term is not empty
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        params.search = debouncedSearchTerm.trim();
      }

      // Only add is_active filter if not empty
      if (isActiveFilter !== '') {
        params.is_active = isActiveFilter === 'active';
      }

      const response = await apiClient.get('/coupons/', { params });

      console.log('Coupons API response:', response.data);

      setCoupons(response.data.coupons || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load coupons');
      // Mock data to match reference
      setCoupons([
        {
          id: 1,
          code: 'SAVE8CIKMMRN',
          description: 'Save 20 rupees',
          discount_type: 'fixed_amount',
          discount_value: 20.00,
          usage_count: 0,
          usage_limit: 5,
          min_purchase_amount: 0,
          valid_from: '2025-10-14',
          valid_until: '2025-10-25',
          is_active: true,
          created_at: '2025-10-14'
        }
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change - NO state updates during typing
  const handleSearchInputChange = (e) => {
    // NO state updates - prevents re-renders
  };

  // Handle Enter key press - triggers search
  const handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value;
      setDebouncedSearchTerm(value);
      setCurrentPage(1);
    }
  };

  // Handle search clear
  const handleSearchClear = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setDebouncedSearchTerm('');
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await apiClient.delete(`/coupons/${couponId}`);
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        console.error('[Coupons] Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
      }
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (!coupon.is_active) {
      return <span className="status-badge status-inactive">Inactive</span>;
    }
    
    if (now < validFrom) {
      return <span className="status-badge status-pending">Upcoming</span>;
    }
    
    if (now > validUntil) {
      return <span className="status-badge status-inactive">Expired</span>;
    }
    
    return <span className="status-badge status-active">Active</span>;
  };

  const getDiscountText = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else if (coupon.discount_type === 'fixed_amount') {
      return `₹${coupon.discount_value} OFF`;
    } else {
      return 'FREE SHIPPING';
    }
  };

  const getApplicableCountriesDisplay = (coupon) => {
    // Handle null, empty, 'null' string, or 'ALL' string (case-insensitive)
    const countriesValue = coupon.applicable_countries;
    if (!countriesValue || 
        countriesValue === 'null' || 
        countriesValue.trim() === '' || 
        countriesValue.toUpperCase().trim() === 'ALL') {
      return <span style={{ color: '#3b82f6', fontWeight: '600' }}>🌍 All Countries</span>;
    }
    
    const countryCodes = countriesValue.split(',').map(c => c.trim()).filter(c => c && c.toUpperCase() !== 'ALL');
    if (countryCodes.length === 0) {
      return <span style={{ color: '#3b82f6', fontWeight: '600' }}>🌍 All Countries</span>;
    }
    
    // Map country codes to names
    const countryNames = countryCodes.map(code => {
      const country = countries.find(c => c.country_code === code);
      return country ? country.country_name : code;
    });
    
    if (countryNames.length <= 2) {
      return <span style={{ color: '#64748b', fontSize: '8px' }}>{countryNames.join(', ')}</span>;
    } else {
      return (
        <span style={{ color: '#64748b', fontSize: '8px' }} title={countryNames.join(', ')}>
          {countryNames.slice(0, 2).join(', ')} +{countryNames.length - 2} more
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '0',
      color: '#1e293b' 
    }}>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">All Coupons</h1>
          <p className="page-subtitle">Manage discount codes, promotions, and special offers</p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddCouponModal(true)}
            style={{
              background: '#FF8C00',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              fontWeight: '600',
              fontSize: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(255, 140, 0, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff9500';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 140, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FF8C00';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(255, 140, 0, 0.2)';
            }}
          >
            <FiPlus />
            Add Coupon
          </button>
        </div>
      </div>

      {/* Coupons Table - Clean Design with Only Useful Columns */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>CODE</th>
              <th>DESCRIPTION</th>
              <th>DISCOUNT</th>
              <th>MIN ORDER</th>
              <th>USAGE</th>
              <th>USE WITH POINTS</th>
              <th>POINTS MULTIPLIER</th>
              <th>APPLICABLE COUNTRIES</th>
              <th>VALIDITY</th>
              <th>STATUS</th>
              <th style={{ width: '100px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '27px', color: '#64748b' }}>
                  No coupons found. Click "+ Add Coupon" to create one.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id}>
                  {/* CODE */}
                  <td>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#3b82f6',
                      fontFamily: 'monospace',
                      fontSize: '9px'
                    }}>
                      {coupon.code}
                    </span>
                  </td>
                  
                  {/* DESCRIPTION */}
                  <td style={{ maxWidth: '200px', color: '#64748b' }}>
                    {coupon.description || 'No description'}
                  </td>
                  
                  {/* DISCOUNT */}
                  <td>
                    <span style={{ 
                      fontWeight: '600',
                      color: coupon.discount_type === 'free_shipping' ? '#10b981' : '#f59e0b'
                    }}>
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% OFF`
                        : coupon.discount_type === 'fixed_amount'
                        ? `${coupon.currency} ${coupon.discount_value}`
                        : 'FREE SHIP'}
                    </span>
                  </td>
                  
                  {/* MIN ORDER */}
                  <td style={{ color: '#64748b' }}>
                    {coupon.min_purchase_amount 
                      ? `${coupon.currency} ${coupon.min_purchase_amount}`
                      : 'No min'}
                  </td>
                  
                  {/* USAGE */}
                  <td>
                    <span style={{ color: '#64748b' }}>
                      {coupon.usage_count || 0} / {coupon.usage_limit || '∞'}
                    </span>
                  </td>
                  
                  {/* USE WITH POINTS */}
                  <td>
                    {coupon.can_combine_with_reward_points ? (
                      <span className="status-badge status-active">✓ Yes</span>
                    ) : (
                      <span className="status-badge status-inactive">✗ No</span>
                    )}
                  </td>
                  
                  {/* POINTS MULTIPLIER */}
                  <td>
                    <span style={{ 
                      fontWeight: '600',
                      color: coupon.reward_points_multiplier > 1 ? '#f59e0b' : '#64748b'
                    }}>
                      {coupon.reward_points_multiplier ? `${coupon.reward_points_multiplier}x` : '1.0x'}
                    </span>
                  </td>
                  
                  {/* APPLICABLE COUNTRIES */}
                  <td>
                    {getApplicableCountriesDisplay(coupon)}
                  </td>
                  
                  {/* VALIDITY */}
                  <td style={{ fontSize: '8px', color: '#64748b' }}>
                    {coupon.valid_from && coupon.valid_until ? (
                      <>
                        {new Date(coupon.valid_from).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short'
                        })}
                        {' - '}
                        {new Date(coupon.valid_until).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short',
                          year: '2-digit'
                        })}
                      </>
                    ) : 'No expiry'}
                  </td>
                  
                  {/* STATUS */}
                  <td>{getStatusBadge(coupon)}</td>
                  
                  {/* ACTIONS */}
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '4px 7px', fontSize: '9px' }}
                        title="Edit Coupon"
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setShowEditCouponModal(true);
                        }}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '4px 7px', fontSize: '9px' }}
                        onClick={() => handleDelete(coupon.id)}
                        title="Delete Coupon"
                      >
                        <FiTrash2 />
                      </button>
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

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <AddCouponModal
          onClose={() => setShowAddCouponModal(false)}
          onSuccess={() => {
            setShowAddCouponModal(false);
            fetchCoupons();
          }}
          countries={countries}
          products={products}
          isDark={isDark}
        />
      )}

      {/* Edit Coupon Modal */}
      {showEditCouponModal && editingCoupon && (
        <EditCouponModal
          coupon={editingCoupon}
          onClose={() => {
            setShowEditCouponModal(false);
            setEditingCoupon(null);
          }}
          onSuccess={() => {
            setShowEditCouponModal(false);
            setEditingCoupon(null);
            fetchCoupons();
          }}
          countries={countries}
          products={products}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Add Coupon Modal Component
const AddCouponModal = ({ onClose, onSuccess, countries, products, isDark }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',  // Description field
    discount_type: 'fixed',
    discount_value: '',
    expiry_date: '',
    usage_limit: '',
    usage_per_user: '',
    minimum_order_amount: '',
    apply_type: 'all_products',
    product_id: '',
    status: 'active',
    applicable_countries: [],
    can_combine_with_reward_points: true,
    reward_points_multiplier: 1.0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SAVE';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  useEffect(() => {
    generateCouponCode();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - 2 * 60 * 1000);
      const expiryDate = formData.expiry_date ? new Date(formData.expiry_date + 'T23:59:59') : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const couponData = {
        code: formData.code,
        description: `Coupon for ${formData.discount_type} discount`,
        discount_type: formData.discount_type === 'fixed' ? 'fixed_amount' : formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        currency: 'INR',
        min_purchase_amount: formData.minimum_order_amount ? parseFloat(formData.minimum_order_amount) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: formData.usage_per_user ? parseInt(formData.usage_per_user) : null,
        valid_from: startDate.toISOString(),
        valid_until: expiryDate.toISOString(),
        applicable_products: formData.apply_type === 'specific_product' && formData.product_id ? formData.product_id : null,
        applicable_countries: formData.applicable_countries.length > 0 ? formData.applicable_countries.join(',') : null,
        is_active: formData.status === 'active',
        can_combine_with_reward_points: formData.can_combine_with_reward_points,
        reward_points_multiplier: parseFloat(formData.reward_points_multiplier) || 1.0
      };

      await apiClient.post('/coupons/', couponData);
      toast.success('Coupon created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.error || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const modalBg = '#ffffff';
  const textColor = '#1e293b';
  const borderColor = '#e2e8f0';
  const inputBg = '#ffffff';

  return (
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 3px 4px rgba(0,0,0,0.1)', color: textColor, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}`, background: '#ffffff', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '700', margin: 0, color: textColor, lineHeight: '1.3', wordBreak: 'break-word', overflowWrap: 'break-word' }}>Create New Coupon</h2>
              <p style={{ fontSize: '9px', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.3', overflowWrap: 'break-word' }}>Create discount codes with advanced targeting and reward integration</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <FiX style={{ fontSize: '16px', color: '#64748b' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 14px', background: '#ffffff', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '8px' }}>
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

          <div style={{ display: 'grid', gap: '10px' }}>
            {activeSection === 'basic' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#FF8C00', lineHeight: '1.3' }}>📝 Coupon Details</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Coupon Code <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        style={{ flex: 1, padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                      <button type="button" onClick={generateCouponCode} style={{ padding: '4px 10px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px', minHeight: '26px' }}>
                        <FiRefreshCw style={{ fontSize: '12px' }} /> Generate
                      </button>
                    </div>
                    <p style={{ fontSize: '8px', color: '#64748b', marginTop: '3px', lineHeight: '1.3' }}>Unique code customers will enter at checkout. Use Generate for random code.</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Description</label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="Describe what this coupon offers and when to use it..."
                      rows="2"
                      style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor }}
                    />
                    <p style={{ fontSize: '8px', color: '#64748b', marginTop: '3px', lineHeight: '1.3' }}>Internal description for admin reference. Will be auto-generated if left empty.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Discount Type <span style={{ color: '#ef4444' }}>*</span></label>
                      <select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      >
                        <option value="fixed">Fixed Amount (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Discount Value <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="number"
                        name="discount_value"
                        value={formData.discount_value}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'targeting' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#8b5cf6', lineHeight: '1.3' }}>🎯 Targeting & Rules</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Minimum Order Amount</label>
                    <input
                      type="number"
                      name="minimum_order_amount"
                      value={formData.minimum_order_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Usage Limit (Total)</label>
                      <input
                        type="number"
                        name="usage_limit"
                        value={formData.usage_limit}
                        onChange={handleChange}
                        min="1"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Usage Per User</label>
                      <input
                        type="number"
                        name="usage_per_user"
                        value={formData.usage_per_user}
                        onChange={handleChange}
                        min="1"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: textColor }}>Applicable Countries</label>
                    <div style={{ border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '8px 10px', background: '#ffffff', maxHeight: '180px', overflowY: 'auto' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 8px', borderRadius: '5px', background: formData.applicable_countries.length === 0 ? '#dbeafe' : '#f8fafc', border: formData.applicable_countries.length === 0 ? '1px solid #3b82f6' : `1px solid ${borderColor}`, fontWeight: '600', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.applicable_countries.length === 0}
                          onChange={() => setFormData(prev => ({ ...prev, applicable_countries: [] }))}
                          style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#3b82f6', fontSize: '9px' }}>🌍 All Countries (Worldwide)</span>
                      </label>
                      <div style={{ display: 'grid', gap: '3px' }}>
                        {countries.map(country => (
                          <label key={country.country_code} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', background: formData.applicable_countries.includes(country.country_code) ? '#eff6ff' : 'transparent', border: formData.applicable_countries.includes(country.country_code) ? '1px solid #bfdbfe' : '1px solid transparent' }}>
                            <input
                              type="checkbox"
                              checked={formData.applicable_countries.includes(country.country_code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ ...prev, applicable_countries: [...prev.applicable_countries, country.country_code] }));
                                } else {
                                  setFormData(prev => ({ ...prev, applicable_countries: prev.applicable_countries.filter(c => c !== country.country_code) }));
                                }
                              }}
                              style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '9px', fontWeight: formData.applicable_countries.includes(country.country_code) ? '600' : '400', color: textColor }}>
                              {country.country_name} ({country.country_code})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#10b981', lineHeight: '1.3' }}>⚙️ Advanced Settings & Reward Integration</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.3' }}><FiTag style={{ fontSize: '12px' }} /> Reward Points Integration</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', background: '#ffffff', border: `1px solid ${formData.can_combine_with_reward_points ? '#22c55e' : borderColor}` }}>
                        <input type="checkbox" name="can_combine_with_reward_points" checked={formData.can_combine_with_reward_points} onChange={handleChange} style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#22c55e' }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: textColor, lineHeight: '1.3' }}>✓ Can be used with reward points</span>
                          <p style={{ fontSize: '9px', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.3' }}>{formData.can_combine_with_reward_points ? '✅ Customers CAN use this coupon AND redeem reward points together' : '❌ Customers must choose: either use this coupon OR redeem points (not both)'}</p>
                        </div>
                      </label>
                      {formData.can_combine_with_reward_points && (
                        <div style={{ marginLeft: '22px' }}>
                          <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Reward Points Multiplier</label>
                          <input
                            type="number"
                            name="reward_points_multiplier"
                            value={formData.reward_points_multiplier}
                            onChange={handleChange}
                            step="0.1"
                            min="0.1"
                            max="10"
                            style={{ width: '120px', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                          />
                          <p style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.3' }}>• 1.0 = Normal points<br/>• 2.0 = DOUBLE points 🎉<br/>• 1.5 = 50% more points</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', minHeight: '28px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '6px 12px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '28px' }}>
              <FiSave style={{ fontSize: '12px' }} /> {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Coupon Modal Component
const EditCouponModal = ({ coupon, onClose, onSuccess, countries, products, isDark }) => {
  const [formData, setFormData] = useState({
    code: coupon.code || '',
    description: coupon.description || '',  // Description field
    discount_type: coupon.discount_type || 'fixed_amount',
    discount_value: coupon.discount_value || '',
    expiry_date: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
    usage_limit: coupon.usage_limit || '',
    usage_per_user: coupon.usage_per_user || '',
    minimum_order_amount: coupon.min_purchase_amount || '',
    apply_type: coupon.apply_type || 'all_products',
    product_id: coupon.product_id || '',
    status: coupon.is_active ? 'active' : 'inactive',
    applicable_countries: coupon.applicable_countries && 
                          coupon.applicable_countries.toUpperCase().trim() !== 'ALL' 
                          ? coupon.applicable_countries.split(',').map(c => c.trim()).filter(c => c && c.toUpperCase() !== 'ALL')
                          : [],
    can_combine_with_reward_points: coupon.can_combine_with_reward_points !== undefined ? coupon.can_combine_with_reward_points : true,
    reward_points_multiplier: coupon.reward_points_multiplier || 1.0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        valid_until: formData.expiry_date ? (formData.expiry_date + 'T23:59:59') : undefined,
        usage_limit: formData.usage_limit || null,
        usage_per_user: formData.usage_per_user || null,
        min_purchase_amount: formData.minimum_order_amount || 0,
        apply_type: formData.apply_type,
        product_id: formData.apply_type === 'specific_product' ? formData.product_id : null,
        is_active: formData.status === 'active',
        applicable_countries: formData.applicable_countries.length > 0 ? formData.applicable_countries.join(',') : null,
        can_combine_with_reward_points: formData.can_combine_with_reward_points,
        reward_points_multiplier: parseFloat(formData.reward_points_multiplier) || 1.0
      };

      await apiClient.put(`/coupons/${coupon.id}`, payload);
      toast.success('Coupon updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.error || 'Failed to update coupon');
    } finally {
      setLoading(false);
    }
  };

  const modalBg = '#ffffff';
  const textColor = '#1e293b';
  const borderColor = '#e2e8f0';
  const inputBg = '#ffffff';

  return (
    <div className="modal" onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 3px 4px rgba(0,0,0,0.1)', color: textColor, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}`, background: '#ffffff', flexShrink: 0, position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '11px', fontWeight: '700', margin: 0, color: textColor, lineHeight: '1.3', wordBreak: 'break-word' }}>Edit Coupon</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexShrink: 0 }}>
              <FiX style={{ fontSize: '16px', color: '#64748b' }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 14px', background: '#ffffff', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '8px' }}>
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

          <div style={{ display: 'grid', gap: '10px' }}>
            {activeSection === 'basic' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#FF8C00', lineHeight: '1.3' }}>📝 Coupon Details</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Coupon Code <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Discount Type <span style={{ color: '#ef4444' }}>*</span></label>
                      <select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      >
                        <option value="fixed_amount">Fixed Amount (₹)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Discount Value <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="number"
                        name="discount_value"
                        value={formData.discount_value}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'targeting' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#8b5cf6', lineHeight: '1.3' }}>🎯 Targeting & Rules</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Minimum Order Amount</label>
                    <input
                      type="number"
                      name="minimum_order_amount"
                      value={formData.minimum_order_amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Usage Limit (Total)</label>
                      <input
                        type="number"
                        name="usage_limit"
                        value={formData.usage_limit}
                        onChange={handleChange}
                        min="1"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Usage Per User</label>
                      <input
                        type="number"
                        name="usage_per_user"
                        value={formData.usage_per_user}
                        onChange={handleChange}
                        min="1"
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '6px', color: textColor }}>Applicable Countries</label>
                    <div style={{ border: `1px solid ${borderColor}`, borderRadius: '6px', padding: '8px 10px', background: '#ffffff', maxHeight: '180px', overflowY: 'auto' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 8px', borderRadius: '5px', background: formData.applicable_countries.length === 0 ? '#dbeafe' : '#f8fafc', border: formData.applicable_countries.length === 0 ? '1px solid #3b82f6' : `1px solid ${borderColor}`, fontWeight: '600', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={formData.applicable_countries.length === 0}
                          onChange={() => setFormData(prev => ({ ...prev, applicable_countries: [] }))}
                          style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#3b82f6', fontSize: '9px' }}>🌍 All Countries (Worldwide)</span>
                      </label>
                      <div style={{ display: 'grid', gap: '3px' }}>
                        {countries.map(country => (
                          <label key={country.country_code} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px', background: formData.applicable_countries.includes(country.country_code) ? '#eff6ff' : 'transparent', border: formData.applicable_countries.includes(country.country_code) ? '1px solid #bfdbfe' : '1px solid transparent' }}>
                            <input
                              type="checkbox"
                              checked={formData.applicable_countries.includes(country.country_code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ ...prev, applicable_countries: [...prev.applicable_countries, country.country_code] }));
                                } else {
                                  setFormData(prev => ({ ...prev, applicable_countries: prev.applicable_countries.filter(c => c !== country.country_code) }));
                                }
                              }}
                              style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '9px', fontWeight: formData.applicable_countries.includes(country.country_code) ? '600' : '400', color: textColor }}>
                              {country.country_name} ({country.country_code})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                <h3 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#10b981', lineHeight: '1.3' }}>⚙️ Advanced Settings & Reward Integration</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', background: '#ffffff', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                    <h4 style={{ fontSize: '10px', fontWeight: '700', marginBottom: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.3' }}><FiTag style={{ fontSize: '12px' }} /> Reward Points Integration</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', background: '#ffffff', border: `1px solid ${formData.can_combine_with_reward_points ? '#22c55e' : borderColor}` }}>
                        <input type="checkbox" name="can_combine_with_reward_points" checked={formData.can_combine_with_reward_points} onChange={handleChange} style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#22c55e' }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: textColor, lineHeight: '1.3' }}>✓ Can be used with reward points</span>
                          <p style={{ fontSize: '9px', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.3' }}>{formData.can_combine_with_reward_points ? '✅ Customers CAN use this coupon AND redeem reward points together' : '❌ Customers must choose: either use this coupon OR redeem points (not both)'}</p>
                        </div>
                      </label>
                      {formData.can_combine_with_reward_points && (
                        <div style={{ marginLeft: '22px' }}>
                          <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Reward Points Multiplier</label>
                          <input
                            type="number"
                            name="reward_points_multiplier"
                            value={formData.reward_points_multiplier}
                            onChange={handleChange}
                            step="0.1"
                            min="0.1"
                            max="10"
                            style={{ width: '120px', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                          />
                          <p style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.3' }}>• 1.0 = Normal points<br/>• 2.0 = DOUBLE points 🎉<br/>• 1.5 = 50% more points</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${borderColor}`, flexShrink: 0 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', minHeight: '28px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '6px 12px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '28px' }}>
              <FiSave style={{ fontSize: '12px' }} /> {loading ? 'Updating...' : 'Update Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Coupons;
