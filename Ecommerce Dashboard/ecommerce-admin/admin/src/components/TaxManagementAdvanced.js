/**
 * Advanced Regional Tax Management Component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiSave, FiX, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import RealtimeSyncIndicator from './RealtimeSyncIndicator';

function TaxManagementAdvanced() {
    const { isDark } = useTheme();
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [newTax, setNewTax] = useState({
        country_code: '', country_name: '', region: '',
        tax_type: 'VAT', tax_name: 'Tax', tax_rate: 0.0,
        calculation_type: 'percentage', price_inclusive: false
    });
    
    const loadTaxes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/advanced/taxes');
            if (response.data.success) {
                setTaxes(response.data.data.taxes || []);
            }
        } catch (err) {
            toast.error('Failed to load taxes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        loadTaxes();
    }, []);
    
    const handleEdit = (tax) => {
        setEditingId(tax.id);
        setEditData({
            tax_rate: tax.tax_rate,
            tax_name: tax.tax_name,
            tax_type: tax.tax_type,
            calculation_type: tax.calculation_type,
            price_inclusive: tax.price_inclusive,
            fixed_amount: tax.fixed_amount,
            is_active: tax.is_active
        });
    };
    
    const handleSave = async (id) => {
        try {
            const response = await api.put(`/advanced/taxes/${id}`, {
                ...editData,
                reason: 'Admin manual update'
            });
            
            if (response.data.success) {
                toast.success('Tax updated successfully');
                setEditingId(null);
                loadTaxes();
                setLastSync(new Date());
                
                // Trigger price recalculation after tax update
                try {
                    const recalcResponse = await api.post('/advanced/pricing/recalculate', {
                        reason: `Automatic recalculation after updating tax rule ${id}`
                    });
                    if (recalcResponse.data.success) {
                        const { recalculated_count } = recalcResponse.data.data || {};
                        toast.success(`Tax updated. Recalculated ${recalculated_count || 0} product prices.`);
                        window.dispatchEvent(new Event('refresh-product-pricing'));
                    }
                } catch (recalcErr) {
                    console.error('Recalculation error:', recalcErr);
                    // Don't show error toast, just log it
                }
            } else {
                toast.error(response.data.message || 'Failed to update');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update tax');
        }
    };
    
    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this tax rule?')) return;
        
        try {
            const response = await api.delete(`/advanced/taxes/${id}`);
            if (response.data.success) {
                toast.success('Tax deleted');
                loadTaxes();
                setLastSync(new Date());
            }
        } catch (err) {
            toast.error('Failed to delete tax');
        }
    };
    
    const handleAdd = async () => {
        try {
            const response = await api.post('/advanced/taxes', newTax);
            if (response.data.success) {
                toast.success('Tax created');
                setOpenAddDialog(false);
                setNewTax({
                    country_code: '', country_name: '', region: '',
                    tax_type: 'VAT', tax_name: 'Tax', tax_rate: 0.0,
                    calculation_type: 'percentage', price_inclusive: false
                });
                loadTaxes();
                setLastSync(new Date());
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create tax');
        }
    };
    
    return (
        <div>
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
                    <h2 className="card-title" style={{ margin: 0, fontSize: '16px' }}>Regional Tax Management</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                                loadTaxes();
                                setLastSync(new Date());
                            }} 
                            style={{ 
                                padding: '8px 12px', 
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <FiRefreshCw style={{ fontSize: '14px' }} />
                            Refresh
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => setOpenAddDialog(true)}
                            style={{ 
                                padding: '8px 12px', 
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <FiPlus style={{ fontSize: '14px' }} />
                            Add Tax Rule
                        </button>
                    </div>
                </div>
                <RealtimeSyncIndicator lastSync={lastSync} />
                <div style={{ padding: 20 }}>
                    {loading && taxes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ fontSize: 14, color: isDark ? '#8b949e' : '#666' }}>Loading tax rules...</div>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Region</th>
                                    <th>Tax Type</th>
                                    <th>Tax Rate (%)</th>
                                    <th>Calculation</th>
                                    <th>Price Inclusive</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxes.map((tax) => (
                                    <tr key={tax.id}>
                                        <td>{tax.country_name} ({tax.country_code})</td>
                                        <td>{tax.region || '-'}</td>
                                        <td>{tax.tax_type}</td>
                                        <td>
                                            {editingId === tax.id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editData.tax_rate}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        tax_rate: parseFloat(e.target.value) || 0
                                                    })}
                                                    style={{ width: 100 }}
                                                />
                                            ) : (
                                                `${tax.tax_rate}%`
                                            )}
                                        </td>
                                        <td>{tax.calculation_type}</td>
                                        <td>
                                            {editingId === tax.id ? (
                                                <input
                                                    type="checkbox"
                                                    checked={editData.price_inclusive}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        price_inclusive: e.target.checked
                                                    })}
                                                />
                                            ) : (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    background: tax.price_inclusive ? '#d1ecf1' : '#e9ecef',
                                                    borderRadius: 4,
                                                    fontSize: 12
                                                }}>
                                                    {tax.price_inclusive ? 'Yes' : 'No'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                background: tax.is_active ? '#d4edda' : '#e9ecef',
                                                borderRadius: 4,
                                                fontSize: 12
                                            }}>
                                                {tax.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            {editingId === tax.id ? (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-primary" onClick={() => handleSave(tax.id)}>
                                                        <FiSave />
                                                    </button>
                                                    <button className="btn btn-secondary" onClick={handleCancel}>
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-secondary" onClick={() => handleEdit(tax)}>
                                                        <FiEdit />
                                                    </button>
                                                    <button className="btn btn-outline" onClick={() => handleDelete(tax.id)}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {/* Add Dialog */}
            {openAddDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{ 
                        background: isDark ? '#1e293b' : '#ffffff',
                        borderRadius: '12px',
                        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.15)',
                        width: '520px',
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 24px',
                            borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                        }}>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '18px',
                                fontWeight: '600',
                                color: isDark ? '#e2e8f0' : '#1e293b'
                            }}>
                                Add New Tax Rule
                            </h3>
                            <button 
                                onClick={() => setOpenAddDialog(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    color: isDark ? '#8b949e' : '#64748b',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    lineHeight: 1
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = isDark ? '#334155' : '#f1f5f9';
                                    e.target.style.color = isDark ? '#e2e8f0' : '#1e293b';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.color = isDark ? '#8b949e' : '#64748b';
                                }}
                            >
                                <FiX style={{ fontSize: '20px' }} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {/* Country Code */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: isDark ? '#cbd5e1' : '#475569'
                                    }}>
                                        Country Code
                                    </label>
                                    <input
                                        value={newTax.country_code}
                                        onChange={(e) => setNewTax({
                                            ...newTax,
                                            country_code: e.target.value.toUpperCase()
                                        })}
                                        placeholder="US"
                                        maxLength={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                            borderRadius: '8px',
                                            background: isDark ? '#0f172a' : '#ffffff',
                                            color: isDark ? '#e2e8f0' : '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FF8C00';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Country Name */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: isDark ? '#cbd5e1' : '#475569'
                                    }}>
                                        Country Name
                                    </label>
                                    <input
                                        value={newTax.country_name}
                                        onChange={(e) => setNewTax({
                                            ...newTax,
                                            country_name: e.target.value
                                        })}
                                        placeholder="United States"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                            borderRadius: '8px',
                                            background: isDark ? '#0f172a' : '#ffffff',
                                            color: isDark ? '#e2e8f0' : '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FF8C00';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Region */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: isDark ? '#cbd5e1' : '#475569'
                                    }}>
                                        Region <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontWeight: 'normal' }}>(Optional)</span>
                                    </label>
                                    <input
                                        value={newTax.region}
                                        onChange={(e) => setNewTax({
                                            ...newTax,
                                            region: e.target.value
                                        })}
                                        placeholder="North America"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                            borderRadius: '8px',
                                            background: isDark ? '#0f172a' : '#ffffff',
                                            color: isDark ? '#e2e8f0' : '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#FF8C00';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                {/* Tax Type and Tax Rate in a row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: isDark ? '#cbd5e1' : '#475569'
                                        }}>
                                            Tax Type
                                        </label>
                                        <select
                                            value={newTax.tax_type}
                                            onChange={(e) => setNewTax({
                                                ...newTax,
                                                tax_type: e.target.value
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '14px',
                                                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                                borderRadius: '8px',
                                                background: isDark ? '#0f172a' : '#ffffff',
                                                color: isDark ? '#e2e8f0' : '#1e293b',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#FF8C00';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="VAT">VAT</option>
                                            <option value="GST">GST</option>
                                            <option value="Sales Tax">Sales Tax</option>
                                            <option value="Service Tax">Service Tax</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: isDark ? '#cbd5e1' : '#475569'
                                        }}>
                                            Tax Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newTax.tax_rate}
                                            onChange={(e) => setNewTax({
                                                ...newTax,
                                                tax_rate: parseFloat(e.target.value) || 0
                                            })}
                                            placeholder="0.00"
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                fontSize: '14px',
                                                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                                borderRadius: '8px',
                                                background: isDark ? '#0f172a' : '#ffffff',
                                                color: isDark ? '#e2e8f0' : '#1e293b',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#FF8C00';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                                marginTop: '24px',
                                paddingTop: '20px',
                                borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
                            }}>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setOpenAddDialog(false)}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleAdd}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Add Tax Rule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaxManagementAdvanced;
