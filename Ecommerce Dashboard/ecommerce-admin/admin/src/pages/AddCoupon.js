import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiRefreshCw, FiX, FiSave, FiTag } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const AddCoupon = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    description: '',  // Description field
    discount_type: 'fixed',
    discount_value: '',
    expiry_date: '',
    usage_limit: '',
    usage_per_user: '',  // Per-user usage limit
    minimum_order_amount: '',
    apply_type: 'all_products',
    product_id: '',
    status: 'active',
    applicable_countries: [],  // Array of country codes
    can_combine_with_reward_points: true,  // Can combine with reward points
    reward_points_multiplier: 1.0  // Points multiplier
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);  // NEW: Countries list
  const [activeSection, setActiveSection] = useState('basic');  // Tab navigation

  // Generate random coupon code
  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SAVE';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  // Auto-generate code on component mount and fetch countries
  useEffect(() => {
    generateCouponCode();
    fetchCountries();
  }, []);
  
  const fetchCountries = async () => {
    try {
      const response = await apiClient.get('/countries/');
      setCountries(response.data.countries || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
      console.log(`[Coupon Form] Checkbox ${name}:`, checked);
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate expiry date
    if (name === 'expiry_date' && value) {
      const selectedDate = new Date(value + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setErrors(prev => ({ ...prev, expiry_date: 'Expiry date cannot be in the past' }));
      } else {
        setErrors(prev => ({ ...prev, expiry_date: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    const newErrors = {};
    if (!formData.code) newErrors.code = 'Coupon code is required';
    if (!formData.discount_value) newErrors.discount_value = 'Discount value is required';
    
    // Validate expiry date
    if (formData.expiry_date) {
      const selectedDate = new Date(formData.expiry_date + 'T00:00:00'); // Ensure local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expiry_date = 'Expiry date cannot be in the past';
      }
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      // Convert frontend data to backend format
      const now = new Date();
      const startDate = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago to ensure it passes backend validation
      const expiryDate = formData.expiry_date ? new Date(formData.expiry_date + 'T23:59:59') : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      
      const couponData = {
        code: formData.code,
        description: formData.description || `Coupon for ${formData.discount_type} discount`,
        discount_type: formData.discount_type === 'fixed' ? 'fixed_amount' : formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        currency: 'INR',
        min_purchase_amount: formData.minimum_order_amount ? parseFloat(formData.minimum_order_amount) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_per_user: formData.usage_per_user ? parseInt(formData.usage_per_user) : null,  // NEW: Use actual value
        valid_from: startDate.toISOString(),
        valid_until: expiryDate.toISOString(),
        applicable_products: formData.apply_type === 'specific_product' && formData.product_id ? formData.product_id : null,
        applicable_countries: formData.applicable_countries.length > 0 ? formData.applicable_countries.join(',') : null,  // NEW: Join array to string
        is_active: formData.status === 'active',
        // REWARD POINTS INTEGRATION - FIXED FIELD NAMES
        can_combine_with_reward_points: formData.can_combine_with_reward_points,
        reward_points_multiplier: parseFloat(formData.reward_points_multiplier) || 1.0
      };

      console.log('[Add Coupon] Sending data:', couponData);

      console.log('Sending coupon data:', couponData);

      const response = await apiClient.post('/coupons/', couponData);

      console.log('Coupon creation response:', response.data);

      toast.success('Coupon created successfully!');
      
      // Reset form
      setFormData({
        code: '',
        description: '',
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
      
      // Generate new code
      generateCouponCode();
      
    } catch (error) {
      console.error('Error creating coupon:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        
        // Show specific error messages
        if (errorMessage.includes('Valid from date cannot be in the past')) {
          setErrors(prev => ({ ...prev, expiry_date: 'Expiry date cannot be in the past' }));
        } else if (errorMessage.includes('Valid until date cannot be in the past')) {
          setErrors(prev => ({ ...prev, expiry_date: 'Expiry date cannot be in the past' }));
        } else if (errorMessage.includes('Coupon code already exists')) {
          setErrors(prev => ({ ...prev, code: 'This coupon code already exists' }));
        } else if (errorMessage.includes('Valid from date must be before valid until date')) {
          setErrors(prev => ({ ...prev, expiry_date: 'Expiry date must be after start date' }));
        }
        
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create coupon. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/coupons');
  };

  const modalBg = '#ffffff';
  const textColor = '#1e293b';
  const borderColor = '#e2e8f0';
  const inputBg = '#ffffff';

  return (
    <div className="add-coupon-container" style={{ padding: '12px 14px' }}>
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div className="page-header-text">
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '4px' }}>Add New Coupon</h1>
          <p className="page-subtitle" style={{ fontSize: '11px' }}>Create discount codes with advanced targeting and reward integration</p>
        </div>
      </div>

      {/* Form */}
      <div className="card" style={{ background: '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '10px 12px' }}>
        <form onSubmit={handleSubmit}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', borderBottom: `1px solid ${borderColor}`, paddingBottom: '8px' }}>
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

          <div style={{ padding: '0', display: 'grid', gap: '10px' }}>
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
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
                        style={{ flex: 1, padding: '4px 8px', border: `1px solid ${errors.code ? '#ef4444' : borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                      <button type="button" onClick={generateCouponCode} style={{ padding: '4px 10px', background: '#FF8C00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px', minHeight: '26px' }}>
                        <FiRefreshCw style={{ fontSize: '12px' }} /> Generate
                      </button>
                    </div>
                    {errors.code && (
                      <div style={{ color: '#ef4444', fontSize: '8px', marginTop: '3px' }}>{errors.code}</div>
                    )}
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
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${errors.discount_value ? '#ef4444' : borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                      {errors.discount_value && (
                        <div style={{ color: '#ef4444', fontSize: '8px', marginTop: '3px' }}>{errors.discount_value}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Expiry Date</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '4px 8px', paddingRight: '30px', border: `1px solid ${errors.expiry_date ? '#ef4444' : borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      />
                      <FiCalendar style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '12px' }} />
                    </div>
                    {errors.expiry_date && (
                      <div style={{ color: '#ef4444', fontSize: '8px', marginTop: '3px' }}>{errors.expiry_date}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Targeting & Rules Section */}
            {activeSection === 'targeting' && (
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
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
                      <p style={{ fontSize: '8px', color: '#64748b', marginTop: '3px', lineHeight: '1.3' }}>💡 Total redemptions allowed across all users</p>
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
                      <p style={{ fontSize: '8px', color: '#64748b', marginTop: '3px', lineHeight: '1.3' }}>💡 How many times each user can use this</p>
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

            {/* Advanced Section */}
            {activeSection === 'advanced' && (
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
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

                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Apply Type</label>
                      <select
                        name="apply_type"
                        value={formData.apply_type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      >
                        <option value="all_products">All Products</option>
                        <option value="specific_product">Specific Product</option>
                        <option value="category">Category</option>
                      </select>
                    </div>

                    {formData.apply_type === 'specific_product' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Product ID</label>
                        <input
                          type="text"
                          name="product_id"
                          value={formData.product_id}
                          onChange={handleChange}
                          placeholder="Enter product ID"
                          style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '9px', fontWeight: '600', marginBottom: '4px', color: textColor }}>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: '5px', fontSize: '9px', background: inputBg, color: textColor, minHeight: '26px' }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${borderColor}` }}>
            <button type="button" onClick={handleCancel} style={{ flex: 1, padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', minHeight: '28px' }}>
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

export default AddCoupon;
