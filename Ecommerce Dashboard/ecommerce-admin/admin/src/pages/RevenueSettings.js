import React, { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiDollarSign,
  FiTarget,
  FiTrendingUp,
  FiSettings,
  FiRefreshCw,
  FiAlertCircle,
  FiPercent,
  FiBell,
  FiDatabase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';

const RevenueSettings = () => {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    currency: 'INR',
    taxRate: 8.5,
    monthlyTarget: 500.00,
    quarterlyTarget: 1500.00,
    yearlyTarget: 6000.00,
    lowStockThreshold: 10,
    autoReorder: true,
    revenueAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    alertThreshold: 80,
    reportingFrequency: 'daily',
    dataRetention: 365
  });
  const [loading, setLoading] = useState(false);
  const [currencies] = useState([
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Inject CSS to override global card-title styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .revenue-settings-page .card-title {
          font-size: 5px !important;
          font-weight: 300 !important;
          line-height: 1.2 !important;
          margin-bottom: 4px !important;
        }
        .revenue-settings-page h4 {
          font-size: 5px !important;
          font-weight: 300 !important;
        }
      `;
      style.id = 'revenue-settings-overrides-styles';
      if (!document.getElementById('revenue-settings-overrides-styles')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('revenue-settings-overrides-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings/revenue');
      
      if (response.data && response.data.settings) {
        const savedSettings = response.data.settings;
        setSettings({
          currency: savedSettings.currency || 'INR',
          taxRate: savedSettings.taxRate || 0,
          monthlyTarget: savedSettings.monthlyTarget || 0,
          quarterlyTarget: savedSettings.quarterlyTarget || 0,
          yearlyTarget: savedSettings.yearlyTarget || 0,
          lowStockThreshold: savedSettings.lowStockThreshold || 0,
          autoReorder: savedSettings.autoReorder || false,
          revenueAlerts: savedSettings.revenueAlerts || false,
          emailNotifications: savedSettings.emailNotifications || false,
          smsNotifications: savedSettings.smsNotifications || false,
          alertThreshold: savedSettings.alertThreshold || 0,
          reportingFrequency: savedSettings.reportingFrequency || 'daily',
          dataRetention: savedSettings.dataRetention || 365
        });
      } else {
        // If no settings found, use defaults
        setSettings({
          currency: 'INR',
          taxRate: 0,
          monthlyTarget: 0,
          quarterlyTarget: 0,
          yearlyTarget: 0,
          lowStockThreshold: 0,
          autoReorder: false,
          revenueAlerts: false,
          emailNotifications: false,
          smsNotifications: false,
          alertThreshold: 0,
          reportingFrequency: 'daily',
          dataRetention: 365
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      // On error, use defaults
      setSettings({
        currency: 'INR',
        taxRate: 0,
        monthlyTarget: 0,
        quarterlyTarget: 0,
        yearlyTarget: 0,
        lowStockThreshold: 0,
        autoReorder: false,
        revenueAlerts: false,
        emailNotifications: false,
        smsNotifications: false,
        alertThreshold: 0,
        reportingFrequency: 'daily',
        dataRetention: 365
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put('/settings/revenue', settings);
      toast.success('Revenue settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const testAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/revenue/check-alerts');
      if (response.data?.success) {
        const alertsCount = response.data.alerts_sent?.length || 0;
        if (alertsCount > 0) {
          toast.success(`${alertsCount} alert(s) sent! Check your notifications.`);
        } else {
          toast.info('Alert check completed. No alerts needed at this time.');
        }
      } else {
        toast.error(response.data?.error || 'Failed to check alerts');
      }
    } catch (error) {
      console.error('Error testing alerts:', error);
      toast.error('Failed to test alerts');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        currency: 'USD',
        taxRate: 8.5,
        monthlyTarget: 500.00,
        quarterlyTarget: 1500.00,
        yearlyTarget: 6000.00,
        lowStockThreshold: 10,
        autoReorder: true,
        revenueAlerts: true,
        emailNotifications: true,
        smsNotifications: false,
        alertThreshold: 80,
        reportingFrequency: 'daily',
        dataRetention: 365
      });
      toast.success('Settings reset to defaults');
    }
  };

  return (
    <div className="page-container revenue-settings-page" style={{ padding: '12px 14px' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '8px 10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '2px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '12px', marginBottom: '1px', lineHeight: '1.2', fontWeight: '500', color: isDark ? '#94a3b8' : '#64748b' }}>Revenue Settings</h1>
          <p className="page-subtitle" style={{ fontSize: '8px', margin: 0, lineHeight: '1.2', color: isDark ? '#8b949e' : '#94a3b8' }}>Configure revenue-related settings and preferences</p>
        </div>

        <div className="page-header-actions" style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          alignItems: 'center', 
          gap: '8px',
          flexShrink: 0
        }}>
          <button 
            className="btn btn-secondary"
            onClick={resetToDefaults}
            style={{ fontSize: '9px', padding: '4px 8px', minHeight: '24px' }}
          >
            <FiRefreshCw style={{ fontSize: '10px' }} />
            Reset
          </button>
          <button 
            className="btn btn-secondary"
            onClick={testAlerts}
            disabled={loading}
            style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', fontSize: '9px', padding: '4px 8px', minHeight: '24px' }}
            title="Test email configuration (alerts are sent automatically when thresholds are met)"
          >
            <FiAlertCircle style={{ fontSize: '10px' }} />
            Test Alerts
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ fontSize: '9px', padding: '4px 8px', minHeight: '24px' }}
          >
            <FiSave style={{ fontSize: '10px' }} />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Currency & Tax Settings */}
        <div className="card" style={{ marginBottom: '6px', padding: '6px 8px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isDark ? '#8b949e' : '#94a3b8' }}>
            <FiDollarSign style={{ fontSize: '5px' }} />
            Currency & Tax Settings
          </h3>
          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Default Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="form-select"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="8.5"
                  step="0.1"
                  min="0"
                  max="100"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
              </div>
            </div>
        </div>

        {/* Revenue Targets */}
        <div className="card" style={{ marginBottom: '6px', padding: '6px 8px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isDark ? '#8b949e' : '#94a3b8' }}>
            <FiTarget style={{ fontSize: '5px' }} />
            Revenue Targets
          </h3>
          
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Monthly Target (₹)</label>
                <input
                  type="number"
                  name="monthlyTarget"
                  value={settings.monthlyTarget}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="500.00"
                  step="0.01"
                  min="0"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Quarterly Target (₹)</label>
                <input
                  type="number"
                  name="quarterlyTarget"
                  value={settings.quarterlyTarget}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="1500.00"
                  step="0.01"
                  min="0"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Yearly Target (₹)</label>
                <input
                  type="number"
                  name="yearlyTarget"
                  value={settings.yearlyTarget}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="6000.00"
                  step="0.01"
                  min="0"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
              </div>
            </div>
        </div>

        {/* Alert Settings */}
        <div className="card" style={{ marginBottom: '6px', padding: '6px 8px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isDark ? '#8b949e' : '#94a3b8' }}>
            <FiBell style={{ fontSize: '5px' }} />
            Alerts & Notifications
          </h3>
          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Alert Threshold (%)</label>
                <input
                  type="number"
                  name="alertThreshold"
                  value={settings.alertThreshold}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="80"
                  min="0"
                  max="100"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
                <small style={{ color: '#64748b', fontSize: '7px', marginTop: '2px', display: 'block', lineHeight: '1.2' }}>
                  Receive alerts when revenue reaches this percentage of target
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Reporting Frequency</label>
                <select
                  name="reportingFrequency"
                  value={settings.reportingFrequency}
                  onChange={handleChange}
                  className="form-select"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div style={{ 
              paddingTop: '6px', 
              borderTop: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
              marginTop: '6px'
            }}>
              <h4 style={{ marginBottom: '3px', color: isDark ? '#8b949e' : '#94a3b8' }}>
                Notification Preferences
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  background: isDark ? '#1e293b' : '#f8fafc',
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    name="revenueAlerts"
                    checked={settings.revenueAlerts}
                    onChange={handleChange}
                    style={{ width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '8px', color: isDark ? '#e6edf3' : '#1e293b', lineHeight: '1.2' }}>Enable Revenue Alerts</span>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  background: isDark ? '#1e293b' : '#f8fafc',
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    style={{ width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '8px', color: isDark ? '#e6edf3' : '#1e293b', lineHeight: '1.2' }}>Email Notifications</span>
                </label>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '5px',
                  background: isDark ? '#1e293b' : '#f8fafc',
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={handleChange}
                    style={{ width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '8px', color: isDark ? '#e6edf3' : '#1e293b', lineHeight: '1.2' }}>SMS Notifications</span>
                </label>
              </div>
            </div>
        </div>

        {/* Data Management */}
        <div className="card" style={{ marginBottom: '6px', padding: '6px 8px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: isDark ? '#8b949e' : '#94a3b8' }}>
            <FiDatabase style={{ fontSize: '5px' }} />
            Data Management
          </h3>
          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Data Retention (Days)</label>
                <input
                  type="number"
                  name="dataRetention"
                  value={settings.dataRetention}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="365"
                  min="30"
                  max="3650"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
                <small style={{ color: '#64748b', fontSize: '7px', marginTop: '2px', display: 'block', lineHeight: '1.2' }}>
                  How long to keep revenue data (30-3650 days)
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '8px', marginBottom: '2px' }}>Low Stock Threshold</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={settings.lowStockThreshold}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="10"
                  min="1"
                  style={{ fontSize: '8px', padding: '3px 6px', minHeight: '22px' }}
                />
                <small style={{ color: '#64748b', fontSize: '7px', marginTop: '2px', display: 'block', lineHeight: '1.2' }}>
                  Alert when product stock falls below this number
                </small>
              </div>
            </div>

            <div style={{ 
              paddingTop: '6px', 
              borderTop: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
              marginTop: '6px'
            }}>
              <h4 style={{ marginBottom: '3px', color: isDark ? '#8b949e' : '#94a3b8' }}>
                Inventory Management
              </h4>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '5px',
                background: isDark ? '#1e293b' : '#f8fafc',
                border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                width: 'fit-content'
              }}>
                <input
                  type="checkbox"
                  name="autoReorder"
                  checked={settings.autoReorder}
                  onChange={handleChange}
                  style={{ width: '12px', height: '12px', cursor: 'pointer', flexShrink: 0 }}
                />
                <span style={{ fontSize: '8px', color: isDark ? '#e6edf3' : '#1e293b', lineHeight: '1.2' }}>Enable Auto Reorder</span>
              </label>
            </div>
        </div>

        {/* Info Notice */}
        <div style={{ 
          padding: '5px 6px', 
          background: '#dbeafe', 
          border: '1px solid #3b82f6', 
          borderRadius: '4px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '3px'
        }}>
          <FiAlertCircle style={{ color: '#3b82f6', fontSize: '9px', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#1e40af', fontSize: '7px', lineHeight: '1.2' }}>Automatic Revenue Alerts:</strong>
            <span style={{ color: '#1e40af', fontSize: '7px', display: 'block', marginTop: '1px', lineHeight: '1.2' }}>
              Revenue alerts are automatically sent via email when your revenue reaches the configured threshold percentage. 
              Alerts are checked automatically when orders are paid and when settings are saved. 
              Use the "Test Alerts" button to verify your email configuration.
            </span>
          </div>
        </div>

        {/* Warning Notice */}
        <div style={{ 
          padding: '5px 6px', 
          background: '#fef3c7', 
          border: '1px solid #f59e0b', 
          borderRadius: '4px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '3px'
        }}>
          <FiAlertCircle style={{ color: '#f59e0b', fontSize: '9px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#92400e', fontSize: '7px', lineHeight: '1.2' }}>Important:</strong>
            <span style={{ color: '#92400e', fontSize: '7px', marginLeft: '3px', lineHeight: '1.2' }}>
              Changes to revenue settings will affect all future calculations and reports. 
              Please review your changes carefully before saving.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
          <button type="button" className="btn btn-secondary" onClick={resetToDefaults} style={{ fontSize: '9px', padding: '4px 8px', minHeight: '24px' }}>
            <FiRefreshCw style={{ fontSize: '10px' }} />
            Reset
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ fontSize: '9px', padding: '4px 8px', minHeight: '24px' }}>
            <FiSave style={{ fontSize: '10px' }} />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RevenueSettings;
