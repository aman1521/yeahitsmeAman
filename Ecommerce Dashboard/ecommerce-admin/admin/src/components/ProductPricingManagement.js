/**
 * Product Pricing Management Component
 * Dynamic pricing with regional adjustments
 */
import React, { useState, useEffect } from 'react';
import { FiEdit, FiSave, FiX, FiRefreshCw, FiLock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

function ProductPricingManagement() {
    const { isDark } = useTheme();
    const [products, setProducts] = useState([]);
    const [countryCode, setCountryCode] = useState('IN');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [expandedProductId, setExpandedProductId] = useState(null);
    
    const countries = [
        { code: 'IN', name: 'India', currency: 'INR' },
        { code: 'US', name: 'United States', currency: 'USD' },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
        { code: 'CA', name: 'Canada', currency: 'CAD' },
        { code: 'AU', name: 'Australia', currency: 'AUD' },
        { code: 'AE', name: 'United Arab Emirates (UAE)', currency: 'AED' },
        { code: 'SG', name: 'Singapore', currency: 'SGD' },
        { code: 'ES', name: 'Spain', currency: 'EUR' }
    ];
    
    const loadProducts = async () => {
        try {
            const response = await api.get('/advanced/pricing/products', {
                params: { country_code: countryCode, include_inactive: false }
            });
            const items = response.data?.data?.products ?? [];
            setProducts(items);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to load products');
            console.error(err);
        }
    };
    
    useEffect(() => {
        loadProducts();
        
        const handleRefresh = () => loadProducts();
        window.addEventListener('refresh-product-pricing', handleRefresh);
        
        return () => {
            window.removeEventListener('refresh-product-pricing', handleRefresh);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryCode]);
    
    const handleEdit = (product) => {
        setEditingId(product.product_id);
        setEditData({
            override_price: product.override_price ?? product.final_price,
            price_locked: product.price_locked || false,
            markup_percentage: 0,
            fixed_adjustment: 0
        });
    };
    
    const handleSave = async (productId) => {
        try {
            const response = await api.post(`/advanced/pricing/products/${productId}/pricing`, {
                country_code: countryCode,
                ...editData,
                reason: 'Admin manual price update'
            });
            
            if (response.data.success) {
                toast.success('Product pricing updated');
                setEditingId(null);
                loadProducts();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update pricing');
        }
    };
    
    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };
    
    const toggleDetails = (productId) => {
        setExpandedProductId(prev => (prev === productId ? null : productId));
    };
    
    const formatCurrency = (symbol, value) => `${symbol}${Number(value || 0).toFixed(2)}`;
    
    const selectedCountry = countries.find(c => c.code === countryCode);
    
    return (
        <div>
            <div className="card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Product Pricing Management</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <select
                            className="form-select"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            style={{ width: 250 }}
                        >
                            {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                    {country.name} ({country.currency})
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-secondary" onClick={loadProducts}>
                            <FiRefreshCw style={{ marginRight: 4 }} />
                            Refresh
                        </button>
                    </div>
                </div>
                <div style={{ padding: 20 }}>
                    <div style={{
                        padding: 12,
                        background: '#d1ecf1',
                        borderRadius: 4,
                        marginBottom: 16,
                        color: '#0c5460'
                    }}>
                        Showing prices for <strong>{selectedCountry?.name}</strong> ({selectedCountry?.currency})
                    </div>
                    
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Base Price (INR)</th>
                                <th>Subtotal</th>
                                <th>Tax</th>
                                <th>Final Price</th>
                                <th>Old Final</th>
                                <th>Δ</th>
                                <th>Status</th>
                                <th>Actions</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <React.Fragment key={product.product_id}>
                                    <tr>
                                        <td>{product.name}</td>
                                        <td>{product.sku || '-'}</td>
                                        <td>₹{Number(product.base_price_inr || 0).toFixed(2)}</td>
                                        <td>
                                            {editingId === product.product_id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editData.override_price}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        override_price: parseFloat(e.target.value) || 0
                                                    })}
                                                    style={{ width: 120 }}
                                                    placeholder={product.currency_symbol}
                                                />
                                            ) : (
                                                `${product.currency_symbol}${Number(product.converted_subtotal || 0).toFixed(2)}`
                                            )}
                                        </td>
                                        <td>
                                            {product.tax_amount > 0 && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    background: '#f8d7da',
                                                    borderRadius: 4,
                                                    fontSize: 12
                                                }}>
                                                    {product.currency_symbol}{Number(product.tax_amount || 0).toFixed(2)} ({Number(product.tax_rate || 0)}%)
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <strong>
                                                {product.currency_symbol}{Number(product.final_price || 0).toFixed(2)}
                                            </strong>
                                        </td>
                                        <td>
                                            {product.old_final_price ? (
                                                <span style={{ color: '#64748b' }}>
                                                    {product.currency_symbol}{Number(product.old_final_price || 0).toFixed(2)}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            {product.old_final_price ? (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: 4,
                                                    background: (Number(product.final_price || 0) - Number(product.old_final_price || 0)) >= 0 ? '#d4edda' : '#f8d7da',
                                                    color: (Number(product.final_price || 0) - Number(product.old_final_price || 0)) >= 0 ? '#155724' : '#721c24',
                                                    fontSize: 12
                                                }}>
                                                    {formatCurrency(
                                                        product.currency_symbol,
                                                        Number(product.final_price || 0) - Number(product.old_final_price || 0)
                                                    )}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                {product.price_locked && (
                                                    <FiLock style={{ color: '#ffc107' }} />
                                                )}
                                                <span style={{
                                                    padding: '4px 8px',
                                                    background: product.price_locked ? '#fff3cd' : '#d4edda',
                                                    borderRadius: 4,
                                                    fontSize: 12
                                                }}>
                                                    {product.price_locked ? 'Locked' : 'Auto'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {editingId === product.product_id ? (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-primary" onClick={() => handleSave(product.product_id)}>
                                                        <FiSave />
                                                    </button>
                                                    <button className="btn btn-secondary" onClick={handleCancel}>
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn btn-secondary" onClick={() => handleEdit(product)}>
                                                    <FiEdit />
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-tertiary"
                                                onClick={() => toggleDetails(product.product_id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                {expandedProductId === product.product_id ? <FiChevronUp /> : <FiChevronDown />}
                                                {expandedProductId === product.product_id ? 'Hide' : 'Details'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedProductId === product.product_id && (
                                        <tr>
                                            <td colSpan={11}>
                                                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 6 }}>
                                                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                                                        <div>
                                                            <strong>Previous stored subtotal:</strong>
                                                            <div>{product.old_price ? formatCurrency(product.currency_symbol, product.old_price) : '—'}</div>
                                                        </div>
                                                        <div>
                                                            <strong>Current subtotal:</strong>
                                                            <div>{formatCurrency(product.currency_symbol, product.converted_subtotal)}</div>
                                                        </div>
                                                        <div>
                                                            <strong>Currency rate:</strong>
                                                            <div>{Number(product.currency_breakdown?.effective_rate || product.currency_rate).toFixed(6)}</div>
                                                            {product.currency_breakdown?.source && (
                                                                <span style={{ fontSize: 12, color: '#64748b' }}>
                                                                    Source: {product.currency_breakdown.source}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: 12 }}>
                                                        <strong>Tax layers</strong>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                                            {(product.tax_breakdown?.layers || []).map((layer, idx) => (
                                                                <div key={idx} style={{
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: 6,
                                                                    padding: '6px 10px',
                                                                    background: layer.applied ? '#d4edda' : '#fff',
                                                                    minWidth: 180
                                                                }}>
                                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{layer.label || layer.layer}</div>
                                                                    <div style={{ fontSize: 12, color: '#475569' }}>
                                                                        {layer.rate != null ? `${layer.rate}${layer.tax_type === 'fixed_amount' ? '' : '%'}` : 'Not set'}
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: layer.applied ? '#166534' : '#94a3b8' }}>
                                                                        {layer.applied ? 'Applied' : 'Skipped'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProductPricingManagement;
