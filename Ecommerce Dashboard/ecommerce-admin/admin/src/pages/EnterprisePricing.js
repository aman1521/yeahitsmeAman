/**
 * Enterprise-Level Currency, Tax, and Pricing Management
 * Similar to Amazon Seller Central / Shopify Admin
 */
import React, { useState } from 'react';
import { FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import CurrencyManagementAdvanced from '../components/CurrencyManagementAdvanced';
import TaxManagementAdvanced from '../components/TaxManagementAdvanced';
import AuditLogViewer from '../components/AuditLogViewer';
import RealtimeSyncIndicator from '../components/RealtimeSyncIndicator';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

function EnterprisePricing() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    
    const handleFetchRates = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/api/currency/fetch-rates', {
                base_currency: 'INR',
                provider: 'exchangerate.host'
            });
            
            if (response.data.success) {
                const { updated_count, unchanged_count, fetched_at } = response.data.data || {};
                const timestampText = fetched_at ? ` · ${new Date(fetched_at).toLocaleString()}` : '';
                toast.success(`Updated ${updated_count ?? 0} currency rates${unchanged_count ? ` (${unchanged_count} unchanged)` : ''}${timestampText}`);
                setLastSync(new Date());
                window.dispatchEvent(new Event('refresh-currency-list'));
                // Prices are automatically recalculated when currency rates change
                toast.success('Product prices are being recalculated automatically...');
                window.dispatchEvent(new Event('refresh-product-pricing'));
            } else {
                toast.error(response.data.message || 'Failed to fetch rates');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch exchange rates');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRecalculatePrices = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post('/api/pricing/recalculate', {
                reason: 'Manual recalculation by admin'
            });
            
            if (response.data.success) {
                const { success, failed, total, details } = response.data.data || {};
                if (success !== undefined) {
                    toast.success(`Recalculated ${success} products${failed > 0 ? ` (${failed} failed)` : ''} out of ${total}`);
                } else {
                    toast.success('Prices recalculated successfully');
                }
                setLastSync(new Date());
                window.dispatchEvent(new Event('refresh-product-pricing'));
            } else {
                toast.error(response.data.message || 'Failed to recalculate prices');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to recalculate prices');
        } finally {
            setLoading(false);
        }
    };
    
    const tabs = [
        { label: 'Currency Management', icon: FiDollarSign },
        { label: 'Regional Taxes', icon: FiDollarSign },
        { label: 'Audit Logs', icon: FiDollarSign }
    ];
    
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 style={{ fontSize: '18px' }}>💱 Enterprise Pricing Management</h2>
                    <p style={{ color: isDark ? '#8b949e' : '#666', marginTop: 4, fontSize: '12px' }}>Manage currencies, regional taxes, and dynamic product pricing</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleFetchRates}
                        disabled={loading}
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
                        {loading ? 'Fetching...' : 'Fetch Live Rates'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleRecalculatePrices}
                        disabled={loading}
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
                        Recalculate Prices
                    </button>
                </div>
            </div>
            
            <RealtimeSyncIndicator lastSync={lastSync} />
            
            {/* Tabs */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${isDark ? '#30363d' : '#eee'}` }}>
                    {tabs.map((tab, idx) => (
                        <button
                            key={idx}
                            className="btn"
                            style={{
                                border: 'none',
                                borderRadius: 0,
                                borderBottom: activeTab === idx ? `2px solid ${isDark ? '#58a6ff' : '#007bff'}` : '2px solid transparent',
                                background: 'transparent',
                                color: activeTab === idx ? (isDark ? '#58a6ff' : '#007bff') : (isDark ? '#8b949e' : '#666'),
                                fontWeight: activeTab === idx ? '600' : 'normal',
                                padding: '8px 16px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                            onClick={() => setActiveTab(idx)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Tab Content - Only render active tab to improve performance */}
            <div>
                {activeTab === 0 && <CurrencyManagementAdvanced key="currency" />}
                {activeTab === 1 && <TaxManagementAdvanced key="tax" />}
                {activeTab === 2 && <AuditLogViewer key="audit" />}
            </div>
        </div>
    );
}

export default EnterprisePricing;
