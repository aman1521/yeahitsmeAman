import React, { useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';

const EditCoupon = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    expiry_date: '',
    usage_limit: '',
    minimum_order_amount: '',
    apply_type: 'all_products',
    product_id: '',
    status: 'active',
    can_combine_with_reward_points: true,  // FIXED: Correct field name
    reward_points_multiplier: 1.0  // NEW: Points multiplier
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      setFetching(true);
      console.log(`[Edit Coupon] Fetching coupon ID: ${id}`);
      const response = await apiClient.get(`/coupons/${id}`);
      
      const coupon = response.data.coupon;
      console.log('[Edit Coupon] Loaded coupon:', coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        expiry_date: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
        usage_limit: coupon.usage_limit || '',
        minimum_order_amount: coupon.min_purchase_amount || '',
        apply_type: coupon.apply_type || 'all_products',
        product_id: coupon.product_id || '',
        status: coupon.is_active ? 'active' : 'inactive',
        can_combine_with_reward_points: coupon.can_combine_with_reward_points !== undefined ? coupon.can_combine_with_reward_points : true,
        reward_points_multiplier: coupon.reward_points_multiplier || 1.0
      });
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast.error('Failed to load coupon');
      navigate('/coupons');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const payload = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        // Only send valid_until; do NOT send valid_from to avoid backend past-date validation
        valid_until: formData.expiry_date ? (formData.expiry_date + 'T23:59:59') : undefined,
        usage_limit: formData.usage_limit || null,
        min_purchase_amount: formData.minimum_order_amount || 0,
        apply_type: formData.apply_type,
        product_id: formData.apply_type === 'specific_product' ? formData.product_id : null,
        is_active: formData.status === 'active',
        // REWARD POINTS FIELDS - FIXED!
        can_combine_with_reward_points: formData.can_combine_with_reward_points,
        reward_points_multiplier: parseFloat(formData.reward_points_multiplier) || 1.0
      };

      console.log(`[Edit Coupon] Updating coupon ID: ${id}`, payload);
      console.log(`[Edit Coupon] Checkbox state: can_combine_with_reward_points = ${formData.can_combine_with_reward_points}`);
      await apiClient.put(`/coupons/${id}`, payload);

      toast.success('✓ Coupon updated successfully!');
      navigate('/coupons');
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error(error.response?.data?.error || 'Failed to update coupon');
      setErrors(error.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/coupons');
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="loading">Loading coupon...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '12px 14px', color: '#1e293b' }}>
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div className="page-header-text">
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '4px' }}>Edit Coupon</h1>
          <p className="page-subtitle" style={{ fontSize: '11px' }}>Update discount code and promotional offer details</p>
        </div>
      </div>

      <div className="card" style={{ padding: '10px 12px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px',
            padding: '0'
          }}>
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>
                  Coupon Code <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className={`form-input ${errors.code ? 'error' : ''}`}
                  required
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Discount Type</label>
                <select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  className="form-select"
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                >
                  <option value="fixed_amount">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Discount Value <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  className={`form-input ${errors.discount_value ? 'error' : ''}`}
                  step="0.01"
                  min="0"
                  required
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Expiry Date</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className={`form-input ${errors.expiry_date ? 'error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ fontSize: '9px', padding: '4px 8px', paddingRight: '30px', minHeight: '26px' }}
                  />
                  <FiCalendar style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#64748b',
                    fontSize: '12px'
                  }} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Usage Limit</label>
                <input
                  type="number"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                  className="form-input"
                  placeholder="Enter usage limit"
                  min="1"
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Minimum Order Amount</label>
                <input
                  type="number"
                  name="minimum_order_amount"
                  value={formData.minimum_order_amount}
                  onChange={(e) => setFormData({...formData, minimum_order_amount: e.target.value})}
                  className="form-input"
                  placeholder="Enter minimum order amount"
                  step="0.01"
                  min="0"
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                />
              </div>

              {/* Reward Points Integration - FIXED */}
              <div style={{ marginBottom: '10px', padding: '10px 12px', background: '#f0f9ff', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="can_combine_with_reward_points"
                    checked={formData.can_combine_with_reward_points}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setFormData({...formData, can_combine_with_reward_points: newValue});
                      console.log('[Edit Coupon] Checkbox changed to:', newValue);
                    }}
                    style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#3b82f6' }}
                  />
                  <span className="form-label" style={{ margin: 0, fontWeight: '600', fontSize: '10px' }}>
                    ✓ Can be used with reward points
                  </span>
                </label>
                <p style={{ fontSize: '9px', color: '#64748b', marginTop: '4px', marginLeft: '22px', lineHeight: '1.3' }}>
                  {formData.can_combine_with_reward_points 
                    ? '✅ Customers CAN use this coupon AND redeem reward points together'
                    : '❌ Customers must choose: either use this coupon OR redeem points (not both)'}
                </p>
                
                {/* Points Multiplier */}
                <div style={{ marginTop: '10px', marginLeft: '22px' }}>
                  <label className="form-label" style={{ fontSize: '9px', fontWeight: '600', marginBottom: '4px' }}>
                    Reward Points Multiplier
                  </label>
                  <input
                    type="number"
                    name="reward_points_multiplier"
                    value={formData.reward_points_multiplier}
                    onChange={(e) => setFormData({...formData, reward_points_multiplier: parseFloat(e.target.value) || 1.0})}
                    className="form-input"
                    placeholder="1.0"
                    step="0.1"
                    min="0.1"
                    max="10"
                    style={{ width: '120px', marginTop: '4px', fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                  />
                  <p style={{ fontSize: '8px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.3' }}>
                    • 1.0 = Normal points<br/>
                    • 2.0 = DOUBLE points 🎉<br/>
                    • 1.5 = 50% more points
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Apply Type</label>
                <select
                  name="apply_type"
                  value={formData.apply_type}
                  onChange={(e) => setFormData({...formData, apply_type: e.target.value})}
                  className="form-select"
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                >
                  <option value="all_products">All Products</option>
                  <option value="specific_product">Specific Product</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {formData.apply_type === 'specific_product' && (
                <div style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Product ID</label>
                  <input
                    type="text"
                    name="product_id"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="form-input"
                    placeholder="Enter product ID"
                    style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="form-select"
                  style={{ fontSize: '9px', padding: '4px 8px', minHeight: '26px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '12px 0 0 0', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '12px'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ fontSize: '10px', padding: '6px 12px', minHeight: '28px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ fontSize: '10px', padding: '6px 12px', minHeight: '28px' }}
            >
              {loading ? 'Updating...' : 'Update Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoupon;

