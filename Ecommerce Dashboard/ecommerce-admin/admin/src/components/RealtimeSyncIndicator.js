/**
 * Real-Time Sync Indicator Component
 * Shows last sync time and sync status
 */
import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

function RealtimeSyncIndicator({ lastSync }) {
    const { isDark } = useTheme();
    const [status, setStatus] = useState('idle'); // idle, syncing, success, error
    const [lastUpdate, setLastUpdate] = useState(null);
    
    // Fetch last sync time from backend on mount (with delay to not block initial render)
    useEffect(() => {
        // Delay fetch slightly to not block initial page load
        const timeoutId = setTimeout(() => {
            const fetchLastSync = async () => {
                try {
                    const response = await api.get('/currency/last-sync');
                    if (response.data.success && response.data.data) {
                        const lastSyncData = response.data.data.last_sync;
                        if (lastSyncData) {
                            // Parse the ISO timestamp string to a Date object
                            const syncDate = new Date(lastSyncData);
                            if (!isNaN(syncDate.getTime())) {
                                setLastUpdate(syncDate);
                                setStatus('success');
                                setTimeout(() => setStatus('idle'), 2000);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch last sync time:', err);
                    // Don't show error to user, just log it
                }
            };
            
            fetchLastSync();
        }, 100); // Small delay to allow page to render first
        
        return () => clearTimeout(timeoutId);
    }, []);
    
    useEffect(() => {
        if (lastSync) {
            setLastUpdate(new Date(lastSync));
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        }
    }, [lastSync]);
    
    useEffect(() => {
        // Poll for recent changes every 30 seconds
        const interval = setInterval(async () => {
            try {
                const response = await api.get('/realtime/changes', {
                    params: { since: lastUpdate?.toISOString() || new Date(Date.now() - 5 * 60000).toISOString() }
                });
                
                if (response.data.success && response.data.data.changes.length > 0) {
                    // Trigger refresh events
                    window.dispatchEvent(new Event('refresh-currency-list'));
                    window.dispatchEvent(new Event('refresh-product-pricing'));
                    setLastUpdate(new Date());
                }
            } catch (err) {
                console.error('Sync check failed:', err);
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, [lastUpdate]);
    
    const formatTime = (date) => {
        if (!date) return 'Never';
        
        try {
            // Ensure date is a Date object
            // Backend now guarantees UTC timestamp with Z suffix
            let dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) {
                // If parsing failed, try appending Z for UTC
                if (typeof date === 'string' && !date.endsWith('Z')) {
                    dateObj = new Date(date + 'Z');
                }
                if (isNaN(dateObj.getTime())) return 'Never';
            }
            
            // Both Date objects store time internally as UTC milliseconds since epoch
            // Direct subtraction gives us the correct difference regardless of timezone
            const now = new Date();
            const diff = now.getTime() - dateObj.getTime(); // Difference in milliseconds
            
            if (diff < 0) return 'Just now'; // Future date, show as just now
            
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            
            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            if (days < 7) return `${days}d ago`;
            
            // For older dates, show formatted date in IST
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(dateObj.getTime() + istOffset);
            const day = String(istDate.getUTCDate()).padStart(2, '0');
            const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
            const year = istDate.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error('Error formatting time:', e);
            return 'Never';
        }
    };
    
    const getIcon = () => {
        if (status === 'syncing') return <FiRefreshCw style={{ 
            animation: 'spin 1s linear infinite',
            transformOrigin: 'center',
            color: isDark ? '#58a6ff' : '#0c5460'
        }} />;
        if (status === 'success') return <FiCheckCircle style={{ 
            color: isDark ? '#3fb950' : '#28a745' 
        }} />;
        if (status === 'error') return <FiAlertCircle style={{ 
            color: isDark ? '#f85149' : '#dc3545' 
        }} />;
        return null;
    };
    
    return (
        <div style={{
            padding: 12,
            background: isDark ? '#161b22' : '#f8f9fa',
            border: `1px solid ${isDark ? '#30363d' : '#e1e4e8'}`,
            borderRadius: 6,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
        }}>
            <span style={{ 
                fontSize: 14, 
                color: isDark ? '#8b949e' : '#666',
                fontWeight: 500
            }}>Last sync:</span>
            <span style={{
                padding: '4px 10px',
                background: status === 'success' ? (isDark ? '#1a472a' : '#d4edda') :
                           status === 'error' ? (isDark ? '#4a1e1e' : '#f8d7da') : 
                           (isDark ? '#21262d' : '#e9ecef'),
                color: status === 'success' ? (isDark ? '#3fb950' : '#155724') :
                       status === 'error' ? (isDark ? '#f85149' : '#721c24') :
                       (isDark ? '#c9d1d9' : '#24292f'),
                borderRadius: 4,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500
            }}>
                {getIcon()}
                {formatTime(lastUpdate || lastSync)}
            </span>
            {status === 'syncing' && (
                <span style={{
                    padding: '4px 10px',
                    background: isDark ? '#1c2128' : '#d1ecf1',
                    color: isDark ? '#58a6ff' : '#0c5460',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500
                }}>
                    Syncing...
                </span>
            )}
        </div>
    );
}

export default RealtimeSyncIndicator;
