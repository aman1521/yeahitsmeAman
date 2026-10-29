/**
 * Audit Log Viewer Component
 * Shows history of all admin actions
 */
import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

function AuditLogViewer() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [entityType, setEntityType] = useState('');
    
    const transformPriceLogs = (logs = []) => {
        return logs.map((log) => {
            // Handle both PricingChangeLog format and PricingAuditLog format
            const timestamp = log.timestamp || log.created_at;
            const timestampDisplay = log.timestamp_display || null; // Use IST formatted timestamp if available
            const entityCode = log.entity_code || 
                (log.product_name && log.country_code ? `${log.product_name} • ${log.country_code}` : 
                 log.entity_id ? `Entity #${log.entity_id}` : 'Unknown');
            const reason = log.reason || log.change_reason || log.notes;
            
            return {
                id: `price-${log.id}`,
                timestamp: timestamp,
                timestamp_display: timestampDisplay,
                entity_type: log.entity_type || 'pricing_change',
                entity_code: entityCode,
                action_type: log.action_type || log.change_type || 'update',
                performed_by: log.performed_by || 'system',
                changed_fields: ['subtotal', 'final_price'],
                reason: reason,
                meta: log.meta || log
            };
        });
    };
    
    const loadLogs = async () => {
        setLoading(true);
        try {
            if (entityType === 'pricing_change') {
                const priceResp = await api.get('/pricing/admin/price-change-logs', {
                    params: { limit: 200 }
                });
                if (priceResp.data.success) {
                    setLogs(transformPriceLogs(priceResp.data?.data?.logs));
                    return;
                }
            }
            
            const response = await api.get('/realtime/changes', {
                params: {
                    entity_type: entityType || undefined
                }
            });
            
            if (response.data.success) {
                setLogs(response.data.data.changes || []);
            }
        } catch (err) {
            // Try legacy endpoint
            try {
                const legacyResponse = await api.get(
                    entityType === 'pricing_change' ? '/pricing/admin/price-change-logs' : '/admin/audit-logs',
                    {
                        params: {
                            entity_type: entityType || undefined,
                            limit: entityType === 'pricing_change' ? 200 : undefined
                        }
                    }
                );
                if (legacyResponse.data.success) {
                    if (entityType === 'pricing_change') {
                        setLogs(transformPriceLogs(legacyResponse.data.data?.logs));
                    } else {
                        setLogs(legacyResponse.data.data.logs || []);
                    }
                }
            } catch (err2) {
                toast.error('Failed to load audit logs');
                console.error(err2);
            }
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType]);
    
    const formatTimestamp = (timestamp, timestampDisplay) => {
        // Use timestamp_display from backend if available (already in IST format)
        if (timestampDisplay) return timestampDisplay;
        
        if (!timestamp) return '-';
        
        try {
            // Parse the timestamp (assume it's UTC if it's an ISO string)
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '-';
            
            // Convert UTC to IST (UTC+5:30) - add 5 hours and 30 minutes
            const utcTime = date.getTime();
            const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
            const istTime = new Date(utcTime + istOffset);
            
            // Format as: DD/MM/YYYY, HH:MM:SS am/pm
            const day = String(istTime.getUTCDate()).padStart(2, '0');
            const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
            const year = istTime.getUTCFullYear();
            const hours = istTime.getUTCHours();
            const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            const displayHours = hours % 12 || 12;
            
            return `${day}/${month}/${year}, ${displayHours}:${minutes}:${seconds} ${ampm}`;
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return '-';
        }
    };
    
    const formatPriceDelta = (meta, log) => {
        if (!meta && !log) return '';
        
        // Try to extract from meta first
        const symbol = meta?.currency_code || '';
        let newFinal = Number(meta?.new_final_price || 0);
        let oldFinal = Number(meta?.old_final_price || 0);
        
        // If meta doesn't have prices, try to parse from log.new_value and log.old_value
        if (!newFinal && log?.new_value) {
            if (typeof log.new_value === 'string' && log.new_value.includes(':')) {
                const parts = log.new_value.split(':');
                if (parts.length >= 2) {
                    try {
                        newFinal = Number(parts[1]);
                        if (!symbol && parts[0]) {
                            return `${parts[0]}${newFinal.toFixed(2)}`;
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
        
        if (!oldFinal && log?.old_value) {
            if (typeof log.old_value === 'string' && log.old_value.includes(':')) {
                const parts = log.old_value.split(':');
                if (parts.length >= 2) {
                    try {
                        oldFinal = Number(parts[1]);
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
        
        if (newFinal === 0 && oldFinal === 0) {
            return log?.new_value || '';
        }
        
        if (oldFinal === 0) {
            return `${symbol}${newFinal.toFixed(2)}`;
        }
        
        const delta = newFinal - oldFinal;
        const sign = delta >= 0 ? '+' : '';
        return `${sign}${symbol}${delta.toFixed(2)} (${symbol}${oldFinal.toFixed(2)} → ${symbol}${newFinal.toFixed(2)})`;
    };
    
    return (
        <div>
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px' }}>
                    <h2 className="card-title" style={{ margin: 0, fontSize: '16px' }}>Audit Logs</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                            className="input"
                            value={entityType}
                            onChange={(e) => {
                                setEntityType(e.target.value);
                            }}
                            style={{ 
                                width: 150, 
                                padding: '8px 12px', 
                                fontSize: '13px',
                                borderRadius: '4px',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <option value="">All</option>
                            <option value="currency">Currency</option>
                            <option value="regional_tax">Tax</option>
                            <option value="product_pricing">Product Pricing</option>
                            <option value="pricing_change">Pricing Changes</option>
                        </select>
                        <button 
                            className="btn btn-secondary" 
                            onClick={loadLogs}
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
                    </div>
                </div>
                <div style={{ padding: '12px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 30, fontSize: '12px' }}>Loading...</div>
                    ) : (
                        <table className="table" style={{ fontSize: '12px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Timestamp</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Entity</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Action</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Performed By</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Changes</th>
                                    <th style={{ padding: '8px', fontSize: '12px' }}>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ fontSize: '12px' }}>
                                        <td style={{ padding: '8px', fontSize: '11px' }}>{formatTimestamp(log.timestamp, log.timestamp_display)}</td>
                                        <td style={{ padding: '8px' }}>
                                            <div>
                                                <strong style={{ fontSize: '12px' }}>{log.entity_type}</strong>
                                                {log.entity_code && (
                                                    <div style={{ fontSize: 11, color: '#666' }}>
                                                        {log.entity_code}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '3px 6px',
                                                background: log.action_type === 'create' ? '#d4edda' :
                                                           log.action_type === 'update' ? '#d1ecf1' :
                                                           log.action_type === 'delete' ? '#f8d7da' : '#e9ecef',
                                                borderRadius: 4,
                                                fontSize: 11
                                            }}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', fontSize: '12px' }}>{log.performed_by || 'system'}</td>
                                        <td style={{ padding: '8px' }}>
                                            {log.changed_fields && log.changed_fields.length > 0 ? (
                                                <div>
                                                    {log.changed_fields.slice(0, 3).map((field, idx) => (
                                                        <span key={idx} style={{
                                                            padding: '2px 5px',
                                                            background: '#e9ecef',
                                                            borderRadius: 3,
                                                            fontSize: 10,
                                                            marginRight: 3,
                                                            display: 'inline-block',
                                                            marginBottom: 3
                                                        }}>
                                                            {field}
                                                        </span>
                                                    ))}
                                                    {log.changed_fields.length > 3 && (
                                                        <span style={{ fontSize: 10, color: '#666' }}>
                                                            +{log.changed_fields.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{ fontSize: 11, color: '#666', display: 'block' }}>
                                                {log.reason || '-'}
                                            </span>
                                            {(log.meta || (log.new_value && log.entity_type === 'product_pricing')) && (
                                                <span style={{ fontSize: 10, color: '#0f172a', display: 'block', marginTop: 3 }}>
                                                    Δ: {formatPriceDelta(log.meta, log)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: '12px' }}>
                                            No audit logs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuditLogViewer;
