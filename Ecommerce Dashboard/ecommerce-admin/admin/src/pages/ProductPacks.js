import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiX,
  FiSave,
  FiRefreshCw,
  FiPackage,
  FiDollarSign,
  FiPercent,
  FiTag
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import SearchBar from '../components/SearchBar';
import ActionsDropdown from '../components/ActionsDropdown';

//hwdevyuefvyefvyfevyfev//

const ProductPacks = () => {
  const [packs, setPacks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    bottles: 1,
    tablets: 0,
    months: 1,
    discount_percentage: 0,
    badge: '',
    display_order: 0,
    is_active: true
  });
  
  // Refs for form inputs to prevent rerendering while typing
  const nameInputRef = useRef(null);
  const bottlesInputRef = useRef(null);
  const tabletsInputRef = useRef(null);
  const monthsInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const badgeInputRef = useRef(null);
  const displayOrderInputRef = useRef(null);

  useEffect(() => {
    fetchPacks();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products/', {
        params: { per_page: 1000, is_active: true }
      });
      const productsData = response.data.products || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/product-packs', {
        suppressErrorToast: true  // Suppress automatic error toast, we'll handle it manually
      });
      // Handle different response structures from backend
      let packsData = [];
      if (Array.isArray(response.data)) {
        packsData = response.data;
      } else if (response.data.packs) {
        packsData = response.data.packs;
      } else if (response.data.product_packs) {
        packsData = response.data.product_packs;
      } else if (response.data.data) {
        packsData = response.data.data;
      }
      
      console.log('Fetched packs:', packsData.length, packsData);
      
      // Filter by search term if provided (empty search shows all)
      let filteredPacks = packsData;
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredPacks = packsData.filter(pack => 
          pack.name?.toLowerCase().includes(searchLower) ||
          pack.product?.name?.toLowerCase().includes(searchLower) ||
          pack.product_name?.toLowerCase().includes(searchLower)
        );
      }
      // If searchTerm is empty, show all packs (no filtering)
      
      setPacks(filteredPacks);
    } catch (error) {
      console.error('Error fetching product packs:', error);
      
      // Only show error toast if it's not a 404 (endpoint not found)
      // 404 means the endpoint doesn't exist on the backend yet
      if (error.response?.status !== 404) {
        toast.error(`Failed to load product packs: ${error.response?.data?.error || error.message}`);
      } else {
        // For 404, set empty array and don't show error (endpoint not implemented yet)
        setPacks([]);
        console.warn('Product packs endpoint not found - feature may not be implemented yet');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPacks();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle input changes - update refs only, sync to state on blur
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Just update the input value directly - no state update to prevent rerender
    // State will be synced on blur
  };
  
  // Sync input values to formData on blur
  const handleInputBlur = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value === '' ? (name === 'bottles' ? 1 : name === 'tablets' ? 0 : name === 'months' ? 1 : 0) : (isNaN(parseFloat(value)) ? 0 : parseFloat(value));
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox changes (these can update immediately)
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setFormData(prev => ({ ...prev, product_id: productId }));
    
    // Auto-calculate prices when product or bottles change
    if (productId && formData.bottles) {
      calculatePrices(productId, formData.bottles, formData.discount_percentage);
    }
  };

  const calculatePrices = async (productId, bottles, discountPercent) => {
    if (!productId) return;
    
    try {
      const product = products.find(p => p.id === parseInt(productId));
      if (product && product.base_price) {
        const originalPrice = bottles * product.base_price;
        const discountAmount = (originalPrice * discountPercent) / 100;
        const finalPrice = originalPrice - discountAmount;
        const savings = discountAmount;
        
        // Update form data with calculated values (for display only)
        // Actual calculation happens on backend
      }
    } catch (error) {
      console.error('Error calculating prices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure all number fields are properly converted
    const submitData = {
      ...formData,
      product_id: parseInt(formData.product_id) || formData.product_id,
      bottles: parseFloat(formData.bottles) || 1,
      tablets: parseFloat(formData.tablets) || 0,
      months: parseFloat(formData.months) || 1,
      discount_percentage: parseFloat(formData.discount_percentage) || 0,
      display_order: parseFloat(formData.display_order) || 0
    };
    
    try {
      if (editingPack) {
        await apiClient.put(`/product-packs/${editingPack.id}`, submitData, {
          suppressErrorToast: false  // Show errors for user actions
        });
        toast.success('Product pack updated successfully!');
      } else {
        await apiClient.post('/product-packs', submitData, {
          suppressErrorToast: false  // Show errors for user actions
        });
        toast.success('Product pack created successfully!');
      }
      
      setShowForm(false);
      setEditingPack(null);
      resetForm();
      fetchPacks();
    } catch (error) {
      console.error('Error saving product pack:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save product pack';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setFormData({
      product_id: pack.product_id,
      name: pack.name || '',
      bottles: pack.bottles || 1,
      tablets: pack.tablets || 0,
      months: pack.months || 1,
      discount_percentage: pack.discount_percentage || 0,
      badge: pack.badge || '',
      display_order: pack.display_order || 0,
      is_active: pack.is_active !== undefined ? pack.is_active : true
    });
    setShowForm(true);
  };

  const handleDelete = async (packId) => {
    if (!window.confirm('Are you sure you want to delete this product pack?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/product-packs/${packId}`, {
        suppressErrorToast: false  // Show errors for user actions
      });
      toast.success('Product pack deleted successfully!');
      fetchPacks();
    } catch (error) {
      console.error('Error deleting product pack:', error);
      toast.error('Failed to delete product pack');
    }
  };

  const handleRecalculate = async (packId) => {
    try {
      await apiClient.post(`/product-packs/${packId}/recalculate`);
      toast.success('Prices recalculated successfully!');
      fetchPacks();
    } catch (error) {
      console.error('Error recalculating prices:', error);
      toast.error('Failed to recalculate prices');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      name: '',
      bottles: 1,
      tablets: 0,
      months: 1,
      discount_percentage: 0,
      badge: '',
      display_order: 0,
      is_active: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPack(null);
    resetForm();
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading && packs.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading product packs...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Product Packs</h1>
          <p className="page-subtitle">Manage product bundles, discounts, and pack configurations</p>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <FiPlus />
            Add Pack
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search packs by name or product..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ 
            maxWidth: '700px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="card-header">
              <h3 className="card-title">
                {editingPack ? 'Edit Product Pack' : 'Add New Product Pack'}
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
            
            <form onSubmit={handleSubmit} style={{ padding: '20px' }} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Product *</label>
                    <select
                      name="product_id"
                      value={formData.product_id}
                      onChange={handleProductChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.base_currency} {product.base_price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Pack Name *</label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      name="name"
                      defaultValue={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="form-input"
                      placeholder="e.g., 1 Bottle, 2 Bottles, 3 Bottles"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Bottles *</label>
                    <input
                      ref={bottlesInputRef}
                      type="number"
                      name="bottles"
                      defaultValue={formData.bottles}
                      onChange={(e) => {
                        // Update ref value only - no state update
                        if (formData.product_id) {
                          const bottlesValue = e.target.value === '' ? 1 : (parseFloat(e.target.value) || 1);
                          const discountValue = formData.discount_percentage === '' ? 0 : (parseFloat(formData.discount_percentage) || 0);
                          calculatePrices(formData.product_id, bottlesValue, discountValue);
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value === '' ? 1 : (parseFloat(e.target.value) || 1);
                        setFormData(prev => ({ ...prev, bottles: value }));
                      }}
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Total Tablets</label>
                    <input
                      ref={tabletsInputRef}
                      type="number"
                      name="tablets"
                      defaultValue={formData.tablets}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Duration (Months)</label>
                    <input
                      ref={monthsInputRef}
                      type="number"
                      name="months"
                      defaultValue={formData.months}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="form-input"
                      min="1"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Discount Percentage (%)</label>
                    <input
                      ref={discountInputRef}
                      type="number"
                      name="discount_percentage"
                      defaultValue={formData.discount_percentage}
                      onChange={(e) => {
                        // Update ref value only - no state update
                        if (formData.product_id) {
                          const newValue = e.target.value === '' ? 0 : (isNaN(parseFloat(e.target.value)) ? 0 : parseFloat(e.target.value));
                          calculatePrices(formData.product_id, formData.bottles, newValue);
                        }
                      }}
                      onBlur={handleInputBlur}
                      className="form-input"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Badge Text</label>
                    <input
                      ref={badgeInputRef}
                      type="text"
                      name="badge"
                      defaultValue={formData.badge}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="form-input"
                      placeholder="e.g., MOST POPULAR, BEST VALUE"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Display Order</label>
                    <input
                      ref={displayOrderInputRef}
                      type="number"
                      name="display_order"
                      defaultValue={formData.display_order}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="form-input"
                      min="0"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleCheckboxChange}
                      />
                      Active Pack
                    </label>
                  </div>

                  {/* Price Preview */}
                  {formData.product_id && (() => {
                    const product = products.find(p => p.id === parseInt(formData.product_id));
                    if (product) {
                      const bottles = parseFloat(formData.bottles) || 1;
                      const discountPercent = parseFloat(formData.discount_percentage) || 0;
                      const originalPrice = bottles * product.base_price;
                      const discountAmount = (originalPrice * discountPercent) / 100;
                      const finalPrice = originalPrice - discountAmount;
                      const savings = discountAmount;
                      
                      return (
                        <div style={{
                          padding: '15px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          marginTop: '10px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Price Preview</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Original:</span>
                            <span style={{ textDecoration: 'line-through' }}>
                              {formatCurrency(originalPrice, product.base_currency)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#64748b' }}>Discount:</span>
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>
                              -{formatCurrency(discountAmount, product.base_currency)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: '600' }}>Final Price:</span>
                            <span style={{ fontWeight: '700', color: '#10b981', fontSize: '16px' }}>
                              {formatCurrency(finalPrice, product.base_currency)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#64748b' }}>You Save:</span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>
                              {formatCurrency(savings, product.base_currency)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                marginTop: '20px', 
                paddingTop: '20px', 
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <FiSave />
                  {editingPack ? 'Update Pack' : 'Create Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Packs Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input type="checkbox" />
              </th>
              <th>PACK NAME</th>
              <th>PRODUCT</th>
              <th>BOTTLES</th>
              <th>TABLETS</th>
              <th>MONTHS</th>
              <th>DISCOUNT</th>
              <th>ORIGINAL PRICE</th>
              <th>FINAL PRICE</th>
              <th>SAVINGS</th>
              <th>BADGE</th>
              <th>STATUS</th>
              <th style={{ width: '120px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {packs.length === 0 ? (
              <tr>
                <td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  {searchTerm 
                    ? 'No packs found matching your search.' 
                    : 'No product packs yet. Click "Add Pack" to create one.'}
                </td>
              </tr>
            ) : (
              packs.map((pack) => {
                const product = products.find(p => p.id === pack.product_id);
                const currency = product?.base_currency || 'INR';
                
                return (
                  <tr key={pack.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{pack.name}</div>
                      {pack.badge && (
                        <div style={{ 
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {pack.badge}
                        </div>
                      )}
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {getProductName(pack.product_id)}
                    </td>
                    <td>{pack.bottles}</td>
                    <td>{pack.tablets || '-'}</td>
                    <td>{pack.months}</td>
                    <td>
                      {pack.discount_percentage > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>
                          {pack.discount_percentage}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {pack.original_price ? (
                        <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                          {formatCurrency(pack.original_price, currency)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ fontWeight: '600', color: '#10b981' }}>
                      {pack.price ? formatCurrency(pack.price, currency) : '-'}
                    </td>
                    <td>
                      {pack.savings > 0 ? (
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          {formatCurrency(pack.savings, currency)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {pack.badge ? (
                        <span style={{
                          padding: '4px 8px',
                          background: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {pack.badge}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${pack.is_active ? 'status-active' : 'status-inactive'}`}>
                        {pack.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        <ActionsDropdown
                          onEdit={() => handleEdit(pack)}
                          onDelete={() => handleDelete(pack.id)}
                          onView={() => {
                            // View details - could open a modal
                            toast.success(`Pack: ${pack.name} - ${pack.bottles} bottles, ${pack.discount_percentage}% off`);
                          }}
                          itemName="pack"
                          editLabel="Edit Pack"
                          deleteLabel="Delete Pack"
                          viewLabel="View Details"
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleRecalculate(pack.id)}
                          style={{ 
                            padding: '6px 10px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Recalculate Prices"
                        >
                          <FiRefreshCw />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPacks;

