/**
 * Advanced Currency Management Component
 * Full CRUD with real-time updates
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiEdit, FiSave, FiX, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import RealtimeSyncIndicator from './RealtimeSyncIndicator';

function CurrencyManagementAdvanced() {
    const { isDark } = useTheme();
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [newCurrency, setNewCurrency] = useState({
        currency_code: '',
        currency_name: '',
        currency_symbol: '',
        api_rate: 1.0,
        markup_percentage: 0,
        custom_value_factor: 1.0,
        adjustment_factor: 1.0
    });

    const computeEffectivePreview = (apiRate, markupPercentage, valueFactor, adjustmentFactor) => {
        let rate = Number(apiRate || 0);
        rate *= (1 + Number(markupPercentage || 0) / 100);
        rate *= Number(valueFactor || 1);
        rate *= Number(adjustmentFactor || 1);
        return rate;
    };

    const formatRate = (value) => Number(value || 0).toFixed(6);
    
    const normalizeCurrency = (currency) => {
        if (!currency) return null;
        const adjustmentFactor = Number(currency.adjustment_factor ?? 1);
        const customValueFactor = Number(currency.custom_value_factor ?? 1);
        const markupPercentage = Number(currency.custom_percentage_change ?? currency.markup_percentage ?? 0);
        const apiRate = Number(currency.api_rate ?? currency.exchange_rate ?? 1);
        const effectiveRate = Number(currency.exchange_rate ?? computeEffectivePreview(apiRate, markupPercentage, customValueFactor, adjustmentFactor));
        const manualOverride = currency.manual_override ?? (adjustmentFactor !== 1 || customValueFactor !== 1 || markupPercentage !== 0);

        return {
            ...currency,
            api_rate: apiRate,
            exchange_rate: effectiveRate,
            effective_rate: effectiveRate,
            manual_override: manualOverride,
            markup_percentage: markupPercentage,
            custom_value_factor: customValueFactor,
            adjustment_factor: adjustmentFactor,
            auto_update_enabled: currency.auto_update_enabled ?? true,
            status: currency.status ?? (currency.is_active ? 'active' : 'inactive'),
            is_active: currency.is_active ?? (currency.status ? currency.status === 'active' : true)
        };
    };

    const loadCurrencies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/advanced/currencies', {
                params: { include_inactive: true }
            });

            const raw = response.data?.data?.currencies ?? response.data?.currencies ?? [];
            const mapped = raw.map(normalizeCurrency).filter(Boolean);
            setCurrencies(mapped);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to load currencies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        // Only load currencies when component mounts (tab is active)
        loadCurrencies();
        
        const handleRefresh = () => loadCurrencies();
        window.addEventListener('refresh-currency-list', handleRefresh);
        
        return () => {
            window.removeEventListener('refresh-currency-list', handleRefresh);
        };
    }, []); // Empty deps - only run on mount
    
    const handleEdit = (currency) => {
        setEditingId(currency.id);
        setEditData({
            exchange_rate: currency.exchange_rate || currency.effective_rate || currency.api_rate,
            status: currency.is_active ? 'active' : 'inactive'
        });
    };
    
    const handleSave = async (id) => {
        try {
            const currency = currencies.find(c => c.id === id);
            if (!currency) {
                toast.error('Currency not found');
                return;
            }

            const newExchangeRate = Number(editData.exchange_rate ?? currency.exchange_rate ?? currency.api_rate ?? 0);
            const apiRate = Number(currency.api_rate ?? 0);
            const isManualOverride = Math.abs(newExchangeRate - apiRate) > 0.0001;
            
            const payload = {
                currency_name: currency.currency_name,
                currency_symbol: currency.currency_symbol,
                exchange_rate: newExchangeRate,
                manual_override: isManualOverride,
                status: editData.status || (currency.is_active ? 'active' : 'inactive'),
                is_active: editData.status ? editData.status === 'active' : currency.is_active
            };

            const response = await api.put(`/advanced/currencies/${currency.currency_code}`, payload);

            if (response.data.success) {
                toast.success(`Currency updated. Exchange rate: ${formatRate(newExchangeRate)}`);
                try {
                    const recalcResponse = await api.post('/advanced/pricing/recalculate', {
                        reason: `Automatic recalculation after updating ${currency.currency_code}`
                    });
                    if (recalcResponse.data.success) {
                        const { recalculated_count, currency_totals } = recalcResponse.data.data || {};
                        if (currency_totals && Object.keys(currency_totals).length > 0) {
                            const summary = Object.entries(currency_totals)
                                .map(([code, count]) => `${code}: ${count}`)
                                .join(', ');
                            toast.success(`Pricing updated → ${summary}`);
                        } else if (typeof recalculated_count === 'number') {
                            toast.success(`Recalculated ${recalculated_count} price entries`);
                        } else {
                            toast.success(recalcResponse.data.message || 'Product prices recalculated');
                        }
                        window.dispatchEvent(new Event('refresh-product-pricing'));
                    } else {
                        toast.error(recalcResponse.data.message || 'Failed to recalculate prices');
                    }
                } catch (recalcErr) {
                    console.error('Recalculation error:', recalcErr);
                    toast.error('Currency saved, but recalculating product prices failed');
                }
                setEditingId(null);
                loadCurrencies();
            } else {
                toast.error(response.data.error || 'Failed to update currency');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update currency');
        }
    };

    const handleDelete = async (code) => {
        if (!window.confirm(`Delete currency ${code}?`)) return;
        
        try {
            const response = await api.delete(`/advanced/currencies/${code}`);
            if (response.data.success) {
                toast.success('Currency deleted');
                loadCurrencies();
            } else {
                toast.error(response.data.error || 'Failed to delete currency');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete currency');
        }
    };

    const handleAdd = async () => {
        try {
            const payload = {
                currency_code: newCurrency.currency_code.trim().toUpperCase(),
                currency_name: newCurrency.currency_name,
                currency_symbol: newCurrency.currency_symbol,
                api_rate: Number(newCurrency.api_rate || 1.0),
                custom_percentage_change: Number(newCurrency.markup_percentage || 0),
                custom_value_factor: Number(newCurrency.custom_value_factor || 1.0),
                adjustment_factor: Number(newCurrency.adjustment_factor || 1.0),
                is_active: true
            };
            
            const response = await api.post('/advanced/currencies', payload);
            if (response.data.success) {
                toast.success('Currency created');
                setOpenAddDialog(false);
                setNewCurrency({
                    currency_code: '',
                    currency_name: '',
                    currency_symbol: '',
                    api_rate: 1.0,
                    markup_percentage: 0,
                    custom_value_factor: 1.0,
                    adjustment_factor: 1.0
                });
                loadCurrencies();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create currency');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };
    
    return (
        <div>
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
                    <h2 className="card-title" style={{ margin: 0, fontSize: '16px' }}>Currency Management</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => {
                                loadCurrencies();
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
                            onClick={async () => {
                                try {
                                    const response = await api.post('/advanced/pricing/recalculate', {
                                        reason: 'Manual bulk recalculation from currency management'
                                    });
                                    if (response.data.success) {
                                        const { recalculated_count, currency_totals } = response.data.data || {};
                                        if (currency_totals && Object.keys(currency_totals).length > 0) {
                                            const summary = Object.entries(currency_totals)
                                                .map(([code, count]) => `${code}: ${count}`)
                                                .join(', ');
                                            toast.success(`Recalculated prices → ${summary}`);
                                        } else {
                                            toast.success(response.data.message || 'Product prices recalculated');
                                        }
                                        window.dispatchEvent(new Event('refresh-product-pricing'));
                                        loadCurrencies();
                                        setLastSync(new Date());
                                    } else {
                                        toast.error(response.data.message || 'Failed to recalculate prices');
                                    }
                                } catch (err) {
                                    toast.error(err.response?.data?.error || 'Failed to recalculate prices');
                                }
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
                            Save Adjustments & Recalculate Prices
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
                            Add Currency
                        </button>
                    </div>
                </div>
                <RealtimeSyncIndicator lastSync={lastSync} />
                <div style={{ padding: '12px' }}>
                    {loading && currencies.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 30 }}>
                            <div style={{ fontSize: 12, color: isDark ? '#8b949e' : '#666' }}>Loading currencies...</div>
                        </div>
                    ) : (
                        <table className="table" style={{ fontSize: '12px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Code</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Name</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Symbol</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Live Rate (API)</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Exchange Rate (Used)</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Last Updated</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Last API Sync</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Status</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map((currency) => {
                                    const isEditing = editingId === currency.id;
                                    const apiRate = Number(currency.api_rate || 0);
                                    const exchangeRate = Number(currency.exchange_rate || currency.effective_rate || apiRate);
                                    const statusValue = isEditing ? (editData.status || (currency.is_active ? 'active' : 'inactive')) : currency.status;
                                    const lastUpdatedDisplay = currency.last_updated?.display
                                        || (currency.last_updated_raw ? new Date(currency.last_updated_raw).toLocaleString() : '—');
                                    const lastApiDisplay = currency.last_api_update?.display
                                        || (currency.last_api_update_raw ? new Date(currency.last_api_update_raw).toLocaleString() : '—');

                                    return (
                                        <tr key={currency.id} style={{ fontSize: '12px' }}>
                                            <td style={{ padding: '8px' }}><strong style={{ fontSize: '12px' }}>{currency.currency_code}</strong></td>
                                            <td style={{ padding: '8px', fontSize: '12px' }}>{currency.currency_name}</td>
                                            <td style={{ padding: '8px', fontSize: '12px' }}>{currency.currency_symbol}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{ fontSize: 11, color: isDark ? '#8b949e' : '#64748b' }}>
                                                    {formatRate(apiRate)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        step="0.000001"
                                                        value={editData.exchange_rate ?? exchangeRate}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            exchange_rate: parseFloat(e.target.value) || 0
                                                        })}
                                                        style={{ width: 100, fontSize: '11px', padding: '4px 6px' }}
                                                        placeholder="Exchange rate"
                                                    />
                                                ) : (
                                                    <span style={{
                                                        padding: '3px 6px',
                                                        background: currency.manual_override 
                                                            ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fff3cd')
                                                            : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d4edda'),
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        color: currency.manual_override 
                                                            ? (isDark ? '#f59e0b' : '#856404')
                                                            : (isDark ? '#10b981' : '#155724'),
                                                        fontWeight: 600
                                                    }}>
                                                        {formatRate(exchangeRate)}
                                                        {currency.manual_override && ' (Manual)'}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{ fontSize: 11 }}>{lastUpdatedDisplay}</span>
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{ fontSize: 11 }}>{lastApiDisplay}</span>
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                {isEditing ? (
                                                    <select
                                                        className="form-select"
                                                        value={statusValue}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            status: e.target.value
                                                        })}
                                                        style={{ width: 100, fontSize: '11px', padding: '4px 6px' }}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                ) : (
                                                    <span style={{
                                                        padding: '3px 6px',
                                                        background: currency.status === 'active' 
                                                            ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d4edda')
                                                            : (isDark ? 'rgba(139, 148, 158, 0.2)' : '#e9ecef'),
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        color: currency.status === 'active'
                                                            ? (isDark ? '#10b981' : '#155724')
                                                            : (isDark ? '#8b949e' : '#6c757d')
                                                    }}>
                                                        {currency.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: 3 }}>
                                                        <button className="btn btn-primary" onClick={() => handleSave(currency.id)} style={{ padding: '4px 6px', fontSize: '11px' }}>
                                                            <FiSave style={{ fontSize: '12px' }} />
                                                        </button>
                                                        <button className="btn btn-secondary" onClick={handleCancel} style={{ padding: '4px 6px', fontSize: '11px' }}>
                                                            <FiX style={{ fontSize: '12px' }} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: 3 }}>
                                                        <button className="btn btn-secondary" onClick={() => handleEdit(currency)} style={{ padding: '4px 6px', fontSize: '11px' }}>
                                                            <FiEdit style={{ fontSize: '12px' }} />
                                                        </button>
                                                        <button className="btn btn-outline" onClick={() => handleDelete(currency.currency_code)} style={{ padding: '4px 6px', fontSize: '11px' }}>
                                                            <FiTrash2 style={{ fontSize: '12px' }} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: 500, maxWidth: '90%' }}>
                        <div className="card-header">
                            <h3>Add New Currency</h3>
                            <button className="btn btn-outline" onClick={() => setOpenAddDialog(false)}>×</button>
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <label>Currency Code (3 letters max, e.g., USD, EUR, INR)</label>
                                <input
                                    className="form-input"
                                    value={newCurrency.currency_code}
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase().slice(0, 3); // Limit to 3 characters
                                        setNewCurrency({
                                            ...newCurrency,
                                            currency_code: value
                                        });
                                    }}
                                    placeholder="USD"
                                    maxLength={3}
                                />
                                {newCurrency.currency_code.length > 3 && (
                                    <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>
                                        Currency code must be exactly 3 characters (e.g., USD, EUR, INR)
                                    </div>
                                )}
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>Currency Name</label>
                                <input
                                    className="form-input"
                                    value={newCurrency.currency_name}
                                    onChange={(e) => setNewCurrency({
                                        ...newCurrency,
                                        currency_name: e.target.value
                                    })}
                                    placeholder="US Dollar"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>Symbol</label>
                                <input
                                    className="form-input"
                                    value={newCurrency.currency_symbol}
                                    onChange={(e) => setNewCurrency({
                                        ...newCurrency,
                                        currency_symbol: e.target.value
                                    })}
                                    placeholder="$"
                                />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>API Rate (vs INR)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    step="0.000001"
                                    value={newCurrency.api_rate}
                                    onChange={(e) => setNewCurrency({
                                        ...newCurrency,
                                        api_rate: parseFloat(e.target.value) || 1.0
                                    })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Markup %</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        value={newCurrency.markup_percentage}
                                        onChange={(e) => setNewCurrency({
                                            ...newCurrency,
                                            markup_percentage: parseFloat(e.target.value) || 0
                                        })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Value Factor</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        value={newCurrency.custom_value_factor}
                                        onChange={(e) => setNewCurrency({
                                            ...newCurrency,
                                            custom_value_factor: parseFloat(e.target.value) || 1
                                        })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Adjustment Factor</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        value={newCurrency.adjustment_factor}
                                        onChange={(e) => setNewCurrency({
                                            ...newCurrency,
                                            adjustment_factor: parseFloat(e.target.value) || 1
                                        })}
                                    />
                                </div>
                            </div>
                            <div style={{
                                marginBottom: 16,
                                padding: 12,
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                fontSize: '13px',
                                color: '#475569'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>Effective Rate Preview</div>
                                <div>
                                    {`${formatRate(newCurrency.api_rate)} × (1 + ${Number(newCurrency.markup_percentage || 0).toFixed(2)}%) × ${Number(newCurrency.custom_value_factor || 1).toFixed(3)} × ${Number(newCurrency.adjustment_factor || 1).toFixed(3)} = `}
                                    <strong>{formatRate(computeEffectivePreview(newCurrency.api_rate, newCurrency.markup_percentage, newCurrency.custom_value_factor, newCurrency.adjustment_factor))}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setOpenAddDialog(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleAdd}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CurrencyManagementAdvanced;
