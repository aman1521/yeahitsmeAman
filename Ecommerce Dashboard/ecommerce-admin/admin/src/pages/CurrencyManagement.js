/**
 * Currency Management Page
 * Manage exchange rates, fetch live rates, manual adjustments, and audit logs
 */
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiRefreshCw, FiEdit, FiSave, FiClock, FiTrendingUp } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const CurrencyManagement = () => {
  const { isDark } = useTheme();
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [adjustmentFactor, setAdjustmentFactor] = useState(1);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [effectiveRate, setEffectiveRate] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [recalculatingPrices, setRecalculatingPrices] = useState(false);
  
  useEffect(() => {
    fetchCurrencies();
  }, []);
  
  useEffect(() => {
    if (selectedCurrency) {
      calculateEffectiveRate();
    }
  }, [selectedCurrency, adjustmentFactor, markupPercentage]);

  // Inject CSS to override global font scaling for Currency Management page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Overrides for Currency Management page to prevent font scaling - High specificity */
        .currency-management-page h1.page-title[style*="fontSize: '18px'"],
        .currency-management-page h1.page-title[style*='fontSize: "18px"'],
        .currency-management-page h1.page-title[style*="fontSize: 18px"],
        .currency-management-page h1[style*="fontSize: '18px'"],
        .currency-management-page h1[style*='fontSize: "18px"'],
        .currency-management-page h1[style*="fontSize: 18px"],
        div.page-container h1.page-title[style*="fontSize: '18px'"],
        div.page-container h1.page-title[style*='fontSize: "18px"'],
        div.page-container h1.page-title[style*="fontSize: 18px"],
        div.page-container h1[style*="fontSize: '18px'"],
        div.page-container h1[style*='fontSize: "18px"'],
        div.page-container h1[style*="fontSize: 18px"] {
          font-size: 18px !important;
        }
        .currency-management-page p.page-subtitle[style*="fontSize: '13px'"],
        .currency-management-page p.page-subtitle[style*='fontSize: "13px"'],
        .currency-management-page p.page-subtitle[style*="fontSize: 13px"],
        .currency-management-page p[style*="fontSize: '13px'"],
        .currency-management-page p[style*='fontSize: "13px"'],
        .currency-management-page p[style*="fontSize: 13px"],
        div.page-container p.page-subtitle[style*="fontSize: '13px'"],
        div.page-container p.page-subtitle[style*='fontSize: "13px"'],
        div.page-container p.page-subtitle[style*="fontSize: 13px"],
        div.page-container p[style*="fontSize: '13px'"],
        div.page-container p[style*='fontSize: "13px"'],
        div.page-container p[style*="fontSize: 13px"] {
          font-size: 13px !important;
        }
        .currency-management-page button[style*="fontSize: '13px'"],
        .currency-management-page button[style*='fontSize: "13px"'],
        .currency-management-page button[style*="fontSize: 13px"],
        div.page-container button[style*="fontSize: '13px'"],
        div.page-container button[style*='fontSize: "13px"'],
        div.page-container button[style*="fontSize: 13px"] {
          font-size: 13px !important;
        }
        .currency-management-page .card h3[style*="fontSize: '16px'"],
        .currency-management-page .card h3[style*='fontSize: "16px"'],
        .currency-management-page .card h3[style*="fontSize: 16px"],
        div.page-container .card h3[style*="fontSize: '16px'"],
        div.page-container .card h3[style*='fontSize: "16px"'],
        div.page-container .card h3[style*="fontSize: 16px"] {
          font-size: 16px !important;
        }
        .currency-management-page .card h3[style*="fontSize: '15px'"],
        .currency-management-page .card h3[style*='fontSize: "15px"'],
        .currency-management-page .card h3[style*="fontSize: 15px"],
        div.page-container .card h3[style*="fontSize: '15px'"],
        div.page-container .card h3[style*='fontSize: "15px"'],
        div.page-container .card h3[style*="fontSize: 15px"] {
          font-size: 15px !important;
        }
        .currency-management-page table.table th[style*="fontSize: '12px'"],
        .currency-management-page table.table th[style*='fontSize: "12px"'],
        .currency-management-page table.table th[style*="fontSize: 12px"],
        .currency-management-page table th[style*="fontSize: '12px'"],
        .currency-management-page table th[style*='fontSize: "12px"'],
        .currency-management-page table th[style*="fontSize: 12px"],
        div.page-container table.table th[style*="fontSize: '12px'"],
        div.page-container table.table th[style*='fontSize: "12px"'],
        div.page-container table.table th[style*="fontSize: 12px"],
        div.page-container table th[style*="fontSize: '12px'"],
        div.page-container table th[style*='fontSize: "12px"'],
        div.page-container table th[style*="fontSize: 12px"] {
          font-size: 12px !important;
        }
        .currency-management-page table.table td[style*="fontSize: '13px'"],
        .currency-management-page table.table td[style*='fontSize: "13px"'],
        .currency-management-page table.table td[style*="fontSize: 13px"],
        .currency-management-page table td[style*="fontSize: '13px'"],
        .currency-management-page table td[style*='fontSize: "13px"'],
        .currency-management-page table td[style*="fontSize: 13px"],
        div.page-container table.table td[style*="fontSize: '13px'"],
        div.page-container table.table td[style*='fontSize: "13px"'],
        div.page-container table.table td[style*="fontSize: 13px"],
        div.page-container table td[style*="fontSize: '13px'"],
        div.page-container table td[style*='fontSize: "13px"'],
        div.page-container table td[style*="fontSize: 13px"] {
          font-size: 13px !important;
        }
        div.page-container table td span[style*="fontSize: '11px'"],
        div.page-container table td span[style*='fontSize: "11px"'],
        div.page-container table td span[style*="fontSize: 11px"],
        .currency-management-page table td span[style*="fontSize: '11px'"],
        .currency-management-page table td span[style*='fontSize: "11px"'],
        .currency-management-page table td span[style*="fontSize: 11px"],
        .currency-management-page span[style*="fontSize: '11px'"],
        .currency-management-page span[style*='fontSize: "11px"'],
        .currency-management-page span[style*="fontSize: 11px"],
        div.page-container span[style*="fontSize: '11px'"],
        div.page-container span[style*='fontSize: "11px"'],
        div.page-container span[style*="fontSize: 11px"] {
          font-size: 11px !important;
        }
        .currency-management-page table td div[style*="fontSize: '13px'"],
        .currency-management-page table td div[style*='fontSize: "13px"'],
        .currency-management-page table td div[style*="fontSize: 13px"],
        .currency-management-page div[style*="fontSize: '13px'"],
        .currency-management-page div[style*='fontSize: "13px"'],
        .currency-management-page div[style*="fontSize: 13px"],
        div.page-container table td div[style*="fontSize: '13px'"],
        div.page-container table td div[style*='fontSize: "13px"'],
        div.page-container table td div[style*="fontSize: 13px"],
        div.page-container div[style*="fontSize: '13px'"],
        div.page-container div[style*='fontSize: "13px"'],
        div.page-container div[style*="fontSize: 13px"] {
          font-size: 13px !important;
        }
        .currency-management-page table td strong[style*="fontSize: '12px'"],
        .currency-management-page table td strong[style*='fontSize: "12px"'],
        .currency-management-page table td strong[style*="fontSize: 12px"],
        .currency-management-page strong[style*="fontSize: '12px'"],
        .currency-management-page strong[style*='fontSize: "12px"'],
        .currency-management-page strong[style*="fontSize: 12px"],
        div.page-container table td strong[style*="fontSize: '12px'"],
        div.page-container table td strong[style*='fontSize: "12px"'],
        div.page-container table td strong[style*="fontSize: 12px"],
        div.page-container strong[style*="fontSize: '12px'"],
        div.page-container strong[style*='fontSize: "12px"'],
        div.page-container strong[style*="fontSize: 12px"] {
          font-size: 12px !important;
        }
        .currency-management-page label[style*="fontSize: '13px'"],
        .currency-management-page label[style*='fontSize: "13px"'],
        .currency-management-page label[style*="fontSize: 13px"],
        div.page-container label[style*="fontSize: '13px'"],
        div.page-container label[style*='fontSize: "13px"'],
        div.page-container label[style*="fontSize: 13px"] {
          font-size: 13px !important;
        }
        .currency-management-page input[style*="fontSize: '14px'"],
        .currency-management-page input[style*='fontSize: "14px"'],
        .currency-management-page input[style*="fontSize: 14px"],
        div.page-container input[style*="fontSize: '14px'"],
        div.page-container input[style*='fontSize: "14px"'],
        div.page-container input[style*="fontSize: 14px"] {
          font-size: 14px !important;
        }
        .currency-management-page .card p[style*="fontSize: '12px'"],
        .currency-management-page .card p[style*='fontSize: "12px"'],
        .currency-management-page .card p[style*="fontSize: 12px"],
        div.page-container .card p[style*="fontSize: '12px'"],
        div.page-container .card p[style*='fontSize: "12px"'],
        div.page-container .card p[style*="fontSize: 12px"] {
          font-size: 12px !important;
        }
        .currency-management-page .card div[style*="fontSize: '15px'"],
        .currency-management-page .card div[style*='fontSize: "15px"'],
        .currency-management-page .card div[style*="fontSize: 15px"],
        div.page-container .card div[style*="fontSize: '15px'"],
        div.page-container .card div[style*='fontSize: "15px"'],
        div.page-container .card div[style*="fontSize: 15px"] {
          font-size: 15px !important;
        }
        .currency-management-page .card div[style*="fontSize: '14px'"],
        .currency-management-page .card div[style*='fontSize: "14px"'],
        .currency-management-page .card div[style*="fontSize: 14px"],
        div.page-container .card div[style*="fontSize: '14px'"],
        div.page-container .card div[style*='fontSize: "14px"'],
        div.page-container .card div[style*="fontSize: 14px"] {
          font-size: 14px !important;
        }
        .currency-management-page .card button[style*="fontSize: '18px'"],
        .currency-management-page .card button[style*='fontSize: "18px"'],
        .currency-management-page .card button[style*="fontSize: 18px"],
        div.page-container .card button[style*="fontSize: '18px'"],
        div.page-container .card button[style*='fontSize: "18px"'],
        div.page-container .card button[style*="fontSize: 18px"] {
          font-size: 18px !important;
        }
        .currency-management-page .card div[style*="fontSize: '48px'"],
        .currency-management-page .card div[style*='fontSize: "48px"'],
        .currency-management-page .card div[style*="fontSize: 48px"],
        div.page-container .card div[style*="fontSize: '48px'"],
        div.page-container .card div[style*='fontSize: "48px"'],
        div.page-container .card div[style*="fontSize: 48px"] {
          font-size: 48px !important;
        }
        /* Override font scaling for Fetch Logs modal table headers - Force 7px */
        .currency-management-page table th[style*="fontSize: '7px'"],
        .currency-management-page table th[style*='fontSize: "7px"'],
        .currency-management-page table th[style*="fontSize: 7px"],
        div.page-container table th[style*="fontSize: '7px'"],
        div.page-container table th[style*='fontSize: "7px"'],
        div.page-container table th[style*="fontSize: 7px"] {
          font-size: 7px !important;
          font-weight: 700 !important;
        }
        /* Override font scaling for Fetch Logs modal table cells - Force 6px */
        .currency-management-page table td[style*="fontSize: '6px'"],
        .currency-management-page table td[style*='fontSize: "6px"'],
        .currency-management-page table td[style*="fontSize: 6px"],
        div.page-container table td[style*="fontSize: '6px'"],
        div.page-container table td[style*='fontSize: "6px"'],
        div.page-container table td[style*="fontSize: 6px"] {
          font-size: 6px !important;
        }
        /* Override font scaling for Fetch Logs modal badges and small text - Force 5px */
        .currency-management-page table td span[style*="fontSize: '5px'"],
        .currency-management-page table td span[style*='fontSize: "5px"'],
        .currency-management-page table td span[style*="fontSize: 5px"],
        .currency-management-page table td strong[style*="fontSize: '5px'"],
        .currency-management-page table td strong[style*='fontSize: "5px"'],
        .currency-management-page table td strong[style*="fontSize: 5px"],
        div.page-container table td span[style*="fontSize: '5px'"],
        div.page-container table td span[style*='fontSize: "5px"'],
        div.page-container table td span[style*="fontSize: 5px"],
        div.page-container table td strong[style*="fontSize: '5px'"],
        div.page-container table td strong[style*='fontSize: "5px"'],
        div.page-container table td strong[style*="fontSize: 5px"] {
          font-size: 5px !important;
        }
        /* Override font scaling for Fetch Logs modal header - Force 9px */
        .currency-management-page .card-header h3[style*="fontSize: '9px'"],
        .currency-management-page .card-header h3[style*='fontSize: "9px"'],
        .currency-management-page .card-header h3[style*="fontSize: 9px"],
        div.page-container .card-header h3[style*="fontSize: '9px'"],
        div.page-container .card-header h3[style*='fontSize: "9px"'],
        div.page-container .card-header h3[style*="fontSize: 9px"] {
          font-size: 9px !important;
          font-weight: 700 !important;
        }
        /* Override font scaling for Fetch Logs modal subtitle - Force 7px */
        .currency-management-page .card-header p[style*="fontSize: '7px'"],
        .currency-management-page .card-header p[style*='fontSize: "7px"'],
        .currency-management-page .card-header p[style*="fontSize: 7px"],
        div.page-container .card-header p[style*="fontSize: '7px'"],
        div.page-container .card-header p[style*='fontSize: "7px"'],
        div.page-container .card-header p[style*="fontSize: 7px"] {
          font-size: 7px !important;
        }
        /* Modal positioning - account for sidebar */
        .currency-management-page [style*="left: '160px'"],
        .currency-management-page [style*='left: "160px"'],
        .currency-management-page [style*="left: 160px"] {
          left: 160px !important;
        }
        /* When sidebar is collapsed (48px) */
        .sidebar.collapsed ~ * .currency-management-page [style*="left: '160px'"],
        .sidebar.collapsed ~ * .currency-management-page [style*='left: "160px"'],
        .sidebar.collapsed ~ * .currency-management-page [style*="left: 160px"] {
          left: 48px !important;
        }
      `;
      style.id = 'currency-management-overrides-styles';
      if (!document.getElementById('currency-management-overrides-styles')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('currency-management-overrides-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);
  
  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/currency/rates');
      const rates = res.data?.data?.rates || res.data?.rates || [];
      setCurrencies(rates);
    } catch (e) {
      console.error('Error fetching currencies:', e);
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveRates = async () => {
    setFetchingRates(true);
    try {
      console.log('🌐 Fetching live currency rates...');
      const res = await apiClient.post('/currency/fetch-rates', {
        base_currency: 'INR',
        provider: 'exchangerate.host'
      });
      
      console.log('📊 Fetch live rates response:', res.data);
      
      if (res.data.success) {
        const { updated_count, unchanged_count, fetched_at, total_rates } = res.data.data || {};
        toast.success(`Updated ${updated_count || 0} currency rates${unchanged_count ? ` (${unchanged_count} unchanged)` : ''} out of ${total_rates || 0} fetched`);
        
        // Force refresh currencies list to show updated rates
        // Add a small delay to ensure backend commit is complete
        setTimeout(async () => {
          await fetchCurrencies();
        }, 500);
        
        // Trigger price recalculation for all currencies
        try {
          console.log('🔄 Triggering price recalculation...');
          await apiClient.post('/pricing/recalculate', {});
          console.log('✅ Price recalculation triggered');
          toast.success('Product prices are being recalculated automatically...');
        } catch (recalcError) {
          console.error('⚠️ Error triggering price recalculation:', recalcError);
          // Don't show error as it's a background operation
        }
      } else {
        toast.error(res.data.message || 'Failed to fetch rates');
      }
    } catch (e) {
      console.error('❌ Error fetching live rates:', e);
      console.error('Error details:', e.response?.data);
      const errorMsg = e.response?.data?.message || e.message || 'Failed to fetch live rates';
      toast.error(errorMsg);
    } finally {
      setFetchingRates(false);
    }
  };
  
  const calculateEffectiveRate = () => {
    if (!selectedCurrency) return;
    
    // Use api_rate as base, fallback to exchange_rate
    const baseRate = parseFloat(selectedCurrency.api_rate || selectedCurrency.exchange_rate || selectedCurrency.rate || 1);
    const adjustment = parseFloat(adjustmentFactor || 1);
    const markup = parseFloat(markupPercentage || 0);
    
    // Effective rate = (api_rate * adjustment_factor) * (1 + markup_percentage / 100)
    const adjustedRate = baseRate * adjustment;
    const finalRate = adjustedRate * (1 + markup / 100);
    
    setEffectiveRate(finalRate);
  };
  
  const saveCurrencyAdjustments = async () => {
    if (!selectedCurrency) {
      toast.error('Please select a currency');
      return;
    }
    
    setLoading(true);
    try {
      // Calculate new exchange rate with adjustment and markup
      const baseApiRate = parseFloat(selectedCurrency.api_rate || selectedCurrency.exchange_rate || 1);
      const adjustment = parseFloat(adjustmentFactor || 1);
      const markup = parseFloat(markupPercentage || 0);
      const valueFactor = 1; // extend UI if needed later
      
      // Effective rate = api_rate * adjustment_factor * value_factor * (1 + markup/100)
      const combinedFactor = adjustment * valueFactor * (1 + markup / 100);
      const finalEffectiveRate = baseApiRate * combinedFactor;
      
      await apiClient.put(`/currency/rates/${selectedCurrency.id}`, {
        adjustment_factor: adjustment,
        custom_percentage_change: markup,
        custom_value_factor: valueFactor,
        exchange_rate: finalEffectiveRate, // backend recomputes, sent for UI consistency
        manual_override: true
      });
      
      toast.success('Currency adjustments saved. Product prices will be recalculated automatically.');
      setSelectedCurrency(null); // Close the panel
      await fetchCurrencies();
      
      // Refresh audit logs if modal is open
      if (showAuditLogs) {
        await fetchAuditLogs();
      }
      
      // Trigger price recalculation for all currencies
      try {
        await apiClient.post('/pricing/recalculate', {});
      } catch (recalcError) {
        console.error('Error triggering price recalculation:', recalcError);
        // Don't show error to user as it's a background operation
      }
    } catch (e) {
      console.error('Error saving adjustments:', e);
      toast.error(e.response?.data?.message || 'Failed to save adjustments');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAuditLogs = async () => {
    try {
      console.log('📋 Fetching currency audit logs...');
      const res = await apiClient.get('/currency/audit-logs?limit=100');
      console.log('📋 Audit logs response:', res.data);
      
      if (res.data.success) {
        const logs = res.data.data?.logs || res.data.logs || [];
        setAuditLogs(logs);
        console.log(`✅ Loaded ${logs.length} audit log entries`);
      } else {
        console.error('Failed to fetch audit logs:', res.data.message);
        setAuditLogs([]);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
      toast.error('Failed to load audit logs');
      setAuditLogs([]);
    }
  };
  
  const recalculateAllPrices = async () => {
    setRecalculatingPrices(true);
    try {
      console.log('🔄 Recalculating all product prices...');
      
      // Get all currencies and recalculate for each
      const allChanges = [];
      let totalSuccess = 0;
      let totalFailed = 0;
      
      // Get all countries
      try {
        const countriesRes = await apiClient.get('/regions/countries');
        const countries = countriesRes.data?.data?.countries || countriesRes.data?.countries || [];
        
        for (const country of countries) {
          if (!country.is_active) continue;
          
          try {
            const response = await apiClient.post('/pricing/recalculate', {
              country_code: country.country_code
            });
            
            if (response.data.success && response.data.data?.details) {
              const details = response.data.data.details || [];
              allChanges.push(...details.map(d => ({
                productName: d.product_name || 'Unknown',
                productId: d.product_id || 0,
                country: d.country_code || country.country_code,
                oldPrice: d.old_price || d.old_final_price || null,
                newPrice: d.new_price || d.subtotal || 0,
                newFinalPrice: d.new_final_price || d.final_price || 0,
                taxRate: d.tax_rate || 0,
                currency: d.currency_code || 'INR',
                success: d.success !== false,
                priceChanged: d.price_changed || false
              })));
              totalSuccess += response.data.data.success || 0;
            } else {
              totalFailed++;
            }
          } catch (e) {
            console.error(`Error recalculating for ${country.country_code}:`, e);
            totalFailed++;
          }
        }
      } catch (e) {
        console.error('Error fetching countries:', e);
      }
      
      // Show summary
      toast.success(
        `✅ Prices recalculated! ${totalSuccess} products updated across all countries.`,
        { duration: 5000 }
      );
      console.log('✅ Recalculation complete:', { totalSuccess, totalFailed, changes: allChanges.length });
      
      // Optionally show a simplified log (too many products to show all)
      if (allChanges.length > 0 && allChanges.length <= 50) {
        // Only show log if reasonable number of changes
        // For now, just log to console
        console.log('📋 Price changes:', allChanges);
      }
    } catch (e) {
      console.error('❌ Error recalculating prices:', e);
      toast.error(e.response?.data?.message || 'Failed to recalculate prices');
    } finally {
      setRecalculatingPrices(false);
    }
  };

    return (
    <div className="page-container currency-management-page">
      <div className="page-header" style={{ padding: '12px 16px', marginBottom: '12px' }}>
        <div className="page-header-text" style={{ gap: '4px' }}>
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '2px', fontWeight: '600' }}>Currency Management</h1>
          <p className="page-subtitle" style={{ fontSize: '13px', margin: 0, color: '#64748b' }}>
            Manage exchange rates, fetch live rates, and apply manual adjustments
          </p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={fetchLiveRates}
            disabled={fetchingRates}
            style={{ padding: '8px 14px', fontSize: '13px', minHeight: '36px' }}
          >
            <FiRefreshCw style={{ marginRight: '6px', fontSize: '14px', animation: fetchingRates ? 'spin 1s linear infinite' : 'none' }} />
            {fetchingRates ? 'Fetching...' : 'Fetch Live Rates'}
          </button>
          <button
            className="btn"
            onClick={recalculateAllPrices}
            disabled={recalculatingPrices}
            style={{
              background: isDark ? '#1f6feb' : '#0366d6',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              fontSize: '13px',
              minHeight: '36px'
            }}
          >
            <FiRefreshCw 
              style={{ 
                marginRight: '6px',
                fontSize: '14px',
                animation: recalculatingPrices ? 'spin 1s linear infinite' : 'none'
              }} 
            />
            {recalculatingPrices ? 'Recalculating...' : 'Recalculate All Prices'}
          </button>
            <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowAuditLogs(!showAuditLogs);
              if (!showAuditLogs) fetchAuditLogs();
            }}
            style={{ padding: '8px 14px', fontSize: '13px', minHeight: '36px' }}
          >
            <FiClock style={{ marginRight: '6px', fontSize: '14px' }} />
            Rate Fetch Logs
            </button>
        </div>
      </div>
      
      {/* Currency Rates Table */}
      <div className="card" style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#1e293b' }}>Currency Exchange Rates</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading...</div>
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Currency</th>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Code</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>API Rate</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Current Rate</th>
                  <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Markup %</th>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Effective Rate</th>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Last Updated</th>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'left', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'right', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
            <tbody>
                {currencies.map(currency => {
                  // Use markup_percentage from backend if available (from custom_percentage_change)
                  // Otherwise calculate from adjustment_factor
                  const adjustmentFactor = Number(currency.admin_adjustment || currency.adjustment_factor || 1);
                  const markupPercentage = currency.markup_percentage !== undefined && currency.markup_percentage !== null
                    ? Number(currency.markup_percentage) 
                    : (adjustmentFactor - 1) * 100;
                  
                return (
                  <tr 
                    key={currency.id || currency.currency_code}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{currency.currency_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#64748b' }}>{currency.currency_code || currency.target_currency}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#1e293b' }}>{Number(currency.api_rate || 0).toFixed(6)}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#1e293b' }}>{Number(currency.exchange_rate || currency.rate || 0).toFixed(6)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: markupPercentage > 0 
                          ? '#16a34a' 
                          : markupPercentage < 0 
                          ? '#dc2626' 
                          : '#64748b'
                      }}>
                        {markupPercentage > 0 ? '+' : ''}{markupPercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <strong style={{ fontSize: '13px', color: '#3b82f6', fontWeight: '600' }}>
                        {Number(currency.final_rate || currency.effective_rate || currency.exchange_rate || 0).toFixed(6)}
                      </strong>
                      </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#64748b' }}>
                      {currency.last_updated_display || (currency.last_updated ? new Date(currency.last_updated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-')}
                    </td>
                  <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: currency.is_active ? '#dcfce7' : '#fee2e2',
                        color: currency.is_active ? '#16a34a' : '#dc2626'
                      }}>
                        {currency.is_active ? 'Active' : 'Inactive'}
                      </span>
                      </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setSelectedCurrency(currency);
                          const adjFactor = currency.admin_adjustment || currency.adjustment_factor || 1;
                          const storedMarkup = currency.custom_percentage_change ?? currency.markup_percentage ?? 0;
                          const effRate = currency.exchange_rate || currency.effective_rate || currency.api_rate || currency.rate || 1;
                          setAdjustmentFactor(adjFactor);
                          setMarkupPercentage(storedMarkup);
                          setEffectiveRate(parseFloat(effRate));
                          // Scroll to adjustment panel
                          setTimeout(() => {
                            const panel = document.getElementById('currency-adjustment-panel');
                            if (panel) {
                              panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          padding: '6px 10px',
                          fontSize: '13px',
                          minHeight: '32px'
                        }}
                        title="Edit currency rate"
                      >
                        <FiEdit style={{ fontSize: '14px' }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            </div>
            )}
          </div>
    </div>
      
      {/* Manual Adjustment Panel */}
      {selectedCurrency && (
        <div id="currency-adjustment-panel" className="card" style={{ marginTop: '12px', borderRadius: '8px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 2px 0', color: '#1e293b' }}>Manual Adjustment: {selectedCurrency.currency_name} ({selectedCurrency.currency_code || selectedCurrency.target_currency})</h3>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                Adjust the exchange rate manually or apply multipliers
              </p>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => {
                setSelectedCurrency(null);
                setAdjustmentFactor(1);
                setMarkupPercentage(0);
              }}
              style={{ 
                background: 'transparent', 
                border: '1px solid #e2e8f0',
                color: '#64748b',
                padding: '6px 10px',
                fontSize: '18px',
                borderRadius: '4px',
                cursor: 'pointer',
                minHeight: '32px',
                fontWeight: '600'
              }}
            >
              ×
            </button>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                  Adjustment Factor
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={adjustmentFactor}
                  onChange={(e) => setAdjustmentFactor(e.target.value)}
                  step="0.0001"
                  min="0"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                />
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                  Multiplier for the base exchange rate (e.g., 1.05 = 5% increase, 0.95 = 5% decrease)
                </p>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                  Markup Percentage (%)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(e.target.value)}
                  step="0.01"
                  min="0"
                  max="100"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                />
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                  Additional percentage markup on top of adjusted rate
                </p>
              </div>
            </div>
            
            {/* Direct Exchange Rate Override */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                Direct Exchange Rate Override (Optional)
              </label>
              <input
                type="number"
                className="form-input"
                value={effectiveRate.toFixed(6)}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  if (!isNaN(newRate) && newRate > 0) {
                    const baseRate = parseFloat(selectedCurrency.api_rate || selectedCurrency.exchange_rate || 1);
                    // Calculate what adjustment factor would give us this rate
                    const calculatedAdjustment = newRate / baseRate;
                    setAdjustmentFactor(calculatedAdjustment.toFixed(4));
                    setMarkupPercentage(0);
                  }
                }}
                step="0.000001"
                min="0"
                style={{ width: '100%', maxWidth: '300px', padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              />
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                Enter a direct exchange rate to override calculations (will auto-calculate adjustment factor)
              </p>
            </div>
            
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FiTrendingUp style={{ color: '#3b82f6', fontSize: '16px' }} />
                <strong style={{ color: '#1e293b', fontSize: '14px' }}>Effective Rate Calculation:</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginLeft: '24px' }}>
                <div>API Rate: {Number(selectedCurrency.api_rate || selectedCurrency.exchange_rate || selectedCurrency.rate || 1).toFixed(6)}</div>
                <div>× Adjustment Factor: {Number(adjustmentFactor).toFixed(4)}</div>
                {markupPercentage > 0 && (
                  <div>× (1 + Markup {markupPercentage}%): {Number(1 + markupPercentage / 100).toFixed(4)}</div>
                )}
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#3b82f6', fontSize: '15px', fontWeight: '600' }}>
                    Effective Rate: {effectiveRate.toFixed(6)}
                  </strong>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                className="btn btn-primary"
                onClick={saveCurrencyAdjustments}
                disabled={loading}
                style={{ padding: '10px 16px', fontSize: '14px', minHeight: '40px' }}
              >
                <FiSave style={{ marginRight: '6px', fontSize: '14px' }} />
                Save Adjustments & Recalculate Prices
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCurrency(null);
                  setAdjustmentFactor(1);
                  setMarkupPercentage(0);
                }}
                disabled={loading}
                style={{ padding: '10px 16px', fontSize: '14px', minHeight: '40px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: '160px', // Account for sidebar width (160px expanded, 48px collapsed)
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000, // Higher than sidebar z-index (1000)
          backdropFilter: 'blur(4px)',
          padding: '16px',
          overflow: 'auto'
        }}>
          <div className="card" style={{ 
            width: '95%', 
            maxWidth: '1200px', 
            maxHeight: '90vh', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            borderRadius: '8px',
            margin: '0 auto'
          }}>
            <div className="card-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              zIndex: 100,
              minHeight: 'auto',
              overflow: 'visible',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '8px', overflow: 'visible' }}>
                <h3 style={{ 
                  margin: '0 0 3px 0', 
                  fontSize: '9px', 
                  fontWeight: '700', 
                  color: '#1e293b', 
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'visible',
                  textOverflow: 'clip',
                  whiteSpace: 'normal'
                }}>Rate Fetch Logs</h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '7px', 
                  color: '#64748b',
                  lineHeight: '1.4',
                  overflowWrap: 'break-word',
                  overflow: 'visible',
                  whiteSpace: 'normal'
                }}>
                  Track all currency rate changes and fetch operations
                </p>
              </div>
              <button 
                className="btn btn-sm" 
                onClick={() => setShowAuditLogs(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  padding: '2px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: '1',
                  minHeight: 'auto',
                  fontWeight: '600',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0'
                }}
              >
                ×
              </button>
            </div>
            <div className="card-body" style={{ 
              padding: '0', 
              overflowY: 'auto', 
              flex: 1,
              background: '#ffffff',
              maxHeight: 'calc(90vh - 70px)',
              minHeight: 0,
              overflowX: 'hidden'
            }}>
              {auditLogs.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px 12px', 
                  color: '#64748b' 
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px', opacity: 0.5 }}>📋</div>
                  <p style={{ fontSize: '8px', fontWeight: '600', marginBottom: '3px' }}>
                    No audit logs available yet
                  </p>
                  <p style={{ fontSize: '7px', marginTop: '3px', lineHeight: '1.3' }}>
                    Audit logs will appear here after you fetch live rates or make manual adjustments.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', padding: '3px' }}>
                  <table className="table" style={{ 
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '7px'
                  }}>
                    <thead>
                      <tr style={{ 
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <th style={{ 
                          padding: '3px 5px', 
                          textAlign: 'left',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontSize: '7px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>Time</th>
                        <th style={{ 
                          padding: '3px 5px', 
                          textAlign: 'left',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontSize: '7px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>Type</th>
                        <th style={{ 
                          padding: '3px 5px', 
                          textAlign: 'left',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontSize: '7px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>Details</th>
                        <th style={{ 
                          padding: '3px 5px', 
                          textAlign: 'left',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontSize: '7px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>Status</th>
                        <th style={{ 
                          padding: '3px 5px', 
                          textAlign: 'left',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontSize: '7px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.2px',
                          whiteSpace: 'nowrap',
                          lineHeight: '1.2'
                        }}>User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, idx) => (
                        <tr 
                          key={log.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={{ 
                            whiteSpace: 'nowrap',
                            padding: '2px 5px',
                            color: '#64748b',
                            fontSize: '6px',
                            lineHeight: '1.2'
                          }}>
                            {log.timestamp_display || (log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'medium' }) : '-')}
                          </td>
                          <td style={{ padding: '2px 5px' }}>
                            <span style={{
                              padding: '1px 3px',
                              borderRadius: '2px',
                              fontSize: '5px',
                              fontWeight: '600',
                              display: 'inline-block',
                              background: log.type === 'fetch' 
                                ? '#dbeafe' 
                                : '#dcfce7',
                              color: log.type === 'fetch' 
                                ? '#1e40af' 
                                : '#166534',
                              border: `1px solid ${log.type === 'fetch' 
                                ? '#93c5fd' 
                                : '#86efac'}`,
                              lineHeight: '1.2'
                            }}>
                              {log.type === 'fetch' ? '🔄 Rate Fetch' : '📊 Rate Change'}
                            </span>
                          </td>
                          <td style={{ padding: '2px 5px' }}>
                            {log.type === 'fetch' ? (
                              <div style={{ fontSize: '6px', lineHeight: '1.2' }}>
                                <div style={{ marginBottom: '1px' }}>
                                  <strong style={{ color: '#3b82f6', fontSize: '5px', fontWeight: '600' }}>Provider:</strong>{' '}
                                  <span style={{ color: '#64748b', fontSize: '6px' }}>{log.provider || 'N/A'}</span>
                                </div>
                                <div style={{ marginBottom: '1px' }}>
                                  <strong style={{ color: '#3b82f6', fontSize: '5px', fontWeight: '600' }}>Base:</strong>{' '}
                                  <span style={{ color: '#64748b', fontSize: '6px' }}>{log.base_currency || 'N/A'}</span>
                                </div>
                                <div style={{ 
                                  display: 'flex', 
                                  gap: '4px',
                                  marginTop: '2px',
                                  paddingTop: '2px',
                                  borderTop: '1px solid #e2e8f0',
                                  flexWrap: 'wrap'
                                }}>
                                  <div>
                                    <span style={{ 
                                      color: '#16a34a',
                                      fontWeight: '600',
                                      fontSize: '5px'
                                    }}>
                                      ✓ {log.updated_count || 0}
                                    </span>
                                    <span style={{ 
                                      color: '#64748b',
                                      marginLeft: '1px',
                                      fontSize: '5px'
                                    }}>updated</span>
                                  </div>
                                  <div>
                                    <span style={{ 
                                      color: '#64748b',
                                      fontWeight: '500',
                                      fontSize: '5px'
                                    }}>
                                      {log.unchanged_count || 0}
                                    </span>
                                    <span style={{ 
                                      color: '#64748b',
                                      marginLeft: '1px',
                                      fontSize: '5px'
                                    }}>unchanged</span>
                                  </div>
                                  {log.raw_payload?.total_rates && (
                                    <div>
                                      <span style={{ 
                                        color: '#3b82f6',
                                        fontWeight: '500',
                                        fontSize: '5px'
                                      }}>
                                        {log.raw_payload.total_rates}
                                      </span>
                                      <span style={{ 
                                        color: '#64748b',
                                        marginLeft: '1px',
                                        fontSize: '5px'
                                      }}>total rates</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '6px', lineHeight: '1.2' }}>
                                <div style={{ marginBottom: '1px' }}>
                                  <strong style={{ color: '#3b82f6', fontSize: '5px', fontWeight: '600' }}>Currency:</strong>{' '}
                                  <span style={{ 
                                    color: '#1e293b',
                                    fontWeight: '600',
                                    fontSize: '6px'
                                  }}>{log.currency_code || 'N/A'}</span>
                                </div>
                                {log.old_rate !== null && log.new_rate !== null && (
                                  <div style={{ 
                                    marginTop: '2px',
                                    paddingTop: '2px',
                                    borderTop: '1px solid #e2e8f0'
                                  }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      gap: '4px',
                                      marginBottom: '1px',
                                      flexWrap: 'wrap'
                                    }}>
                                      <div>
                                        <span style={{ 
                                          color: '#64748b',
                                          fontSize: '5px'
                                        }}>Old:</span>{' '}
                                        <span style={{ color: '#1e293b', fontSize: '6px' }}>
                                          {Number(log.old_rate).toFixed(6)}
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ 
                                          color: '#64748b',
                                          fontSize: '5px'
                                        }}>New:</span>{' '}
                                        <span style={{ 
                                          color: '#16a34a',
                                          fontWeight: '600',
                                          fontSize: '6px'
                                        }}>
                                          {Number(log.new_rate).toFixed(6)}
                                        </span>
                                      </div>
                                    </div>
                                    {log.rate_change_percent !== null && (
                                      <div>
                                        <strong style={{ color: '#64748b', fontSize: '5px', fontWeight: '600' }}>Change:</strong>{' '}
                                        <span style={{ 
                                          color: log.rate_change_percent > 0 
                                            ? '#16a34a' 
                                            : '#dc2626',
                                          fontWeight: '600',
                                          fontSize: '6px'
                                        }}>
                                          {log.rate_change_percent > 0 ? '↑ +' : '↓ '}{Number(log.rate_change_percent).toFixed(2)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {log.change_reason && (
                                  <div style={{ 
                                    marginTop: '2px', 
                                    padding: '1px 3px',
                                    background: '#f8fafc',
                                    borderRadius: '2px',
                                    color: '#64748b',
                                    fontSize: '5px',
                                    fontStyle: 'italic'
                                  }}>
                                    {log.change_reason}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '2px 5px' }}>
                            {log.status && (
                              <span style={{
                                padding: '1px 3px',
                                borderRadius: '2px',
                                fontSize: '5px',
                                fontWeight: '600',
                                display: 'inline-block',
                                background: log.status === 'success' 
                                  ? '#dcfce7' 
                                  : '#fee2e2',
                                color: log.status === 'success' 
                                  ? '#16a34a' 
                                  : '#dc2626',
                                border: `1px solid ${log.status === 'success' 
                                  ? '#86efac' 
                                  : '#fca5a5'}`,
                                lineHeight: '1.2'
                              }}>
                                {log.status === 'success' ? '✓ ' : '✗ '}{log.status}
                              </span>
                            )}
                            {log.change_source && (
                              <div style={{ 
                                fontSize: '5px', 
                                color: '#64748b', 
                                marginTop: '2px',
                                padding: '1px 3px',
                                background: '#f8fafc',
                                borderRadius: '2px',
                                display: 'inline-block',
                                lineHeight: '1.2'
                              }}>
                                {log.change_source}
                              </div>
                            )}
                          </td>
                          <td style={{ 
                            fontSize: '6px',
                            padding: '2px 5px',
                            color: '#64748b',
                            lineHeight: '1.2'
                          }}>
                            {log.fetched_by || log.changed_by || 'system'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyManagement;
