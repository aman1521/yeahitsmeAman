/**
 * Shopify-Style Tax Management Page
 * Regional tax rates only - no product-specific or category-specific taxes
 * Matches Shopify's tax management system
 */
import React, { useState, useEffect } from 'react';
import { FiGlobe, FiSettings, FiSave, FiRefreshCw, FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiInfo, FiMapPin } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const TaxManagement = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Tax Settings State
  const [taxSettings, setTaxSettings] = useState({
    tax_inclusive_pricing: false,
    show_tax_in_cart: true,
    show_tax_on_product: true,
    automatic_tax_calculation: true
  });
  
  // Regional Tax State
  const [countries, setCountries] = useState([]);
  const [regionalTaxes, setRegionalTaxes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editingTax, setEditingTax] = useState(null);
  
  // Tax Exemptions State
  const [taxExemptProducts, setTaxExemptProducts] = useState([]);
  const [showExemptionsModal, setShowExemptionsModal] = useState(false);
  const [exemptionSearch, setExemptionSearch] = useState('');
  const [exemptionProducts, setExemptionProducts] = useState([]);
  
  // Form State for Adding/Editing Tax
  const [taxForm, setTaxForm] = useState({
    country_code: '',
    country_name: '',
    tax_rate: 0,
    tax_name: 'GST',
    tax_type: 'GST',
    price_inclusive: false,
    shipping_tax_rate: 0,
    state_code: '',
    state_name: ''
  });
  
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  
  // Fetch Countries and Regional Taxes on mount
  useEffect(() => {
    fetchCountries();
    fetchRegionalTaxes();
    fetchTaxSettings();
    fetchTaxExemptions();
  }, []);
  
  const fetchTaxSettings = async () => {
    try {
      const res = await apiClient.get('/api/tax/settings');
      if (res.data?.success) {
        setTaxSettings(res.data.data || taxSettings);
      }
    } catch (e) {
      console.error('Error fetching tax settings:', e);
    }
  };
  
  const fetchCountries = async () => {
    setLoading(true);
    try {
      // Fetch countries based on currencies from the currencies table
      const res = await apiClient.get('/api/tax/countries-from-currencies');
      const countriesList = res.data?.data?.countries || res.data?.countries || [];
      
      // Normalize country codes and remove duplicates
      // Map 2-letter codes to 3-letter codes for consistency (AU -> AUS, US -> USA, etc.)
      const normalizeCode = (code) => {
        if (!code) return null;
        const codeMap = {
          'AU': 'AUS', 'IN': 'IND', 'US': 'USA', 'GB': 'GBR', 'CA': 'CAN',
          'JP': 'JPN', 'CN': 'CHN', 'BR': 'BRA', 'SG': 'SGP', 'CH': 'CHE',
          'ZA': 'ZAF', 'NZ': 'NZL', 'AE': 'ARE', 'SA': 'SAU', 'DE': 'DEU',
          'FR': 'FRA', 'IT': 'ITA', 'ES': 'ESP', 'NL': 'NLD', 'BE': 'BEL',
          'AT': 'AUT', 'SE': 'SWE', 'NO': 'NOR', 'DK': 'DNK', 'FI': 'FIN',
          'PL': 'POL', 'CZ': 'CZE', 'HU': 'HUN', 'RO': 'ROU', 'GR': 'GRC',
          'PT': 'PRT', 'IE': 'IRL', 'MX': 'MEX', 'AR': 'ARG', 'CL': 'CHL',
          'CO': 'COL', 'PE': 'PER', 'KR': 'KOR', 'TH': 'THA', 'MY': 'MYS',
          'ID': 'IDN', 'PH': 'PHL', 'VN': 'VNM', 'IL': 'ISR', 'EG': 'EGY',
          'PK': 'PAK', 'BD': 'BGD', 'LK': 'LKA', 'NP': 'NPL'
        };
        const upper = code.toUpperCase().trim();
        if (upper.length === 2 && codeMap[upper]) {
          return codeMap[upper];
        }
        return upper;
      };
      
      const seen = new Set();
      const uniqueCountries = countriesList.filter(country => {
        if (!country || !country.country_code) return false;
        const normalized = normalizeCode(country.country_code);
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        // Update country code to normalized version
        country.country_code = normalized;
        return true;
      });
      
      setCountries(uniqueCountries);
    } catch (e) {
      console.error('Error fetching countries from currencies:', e);
        toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRegionalTaxes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/tax/rates');
      const taxes = res.data?.data?.taxes || res.data?.taxes || [];
      console.log('[TaxManagement] Fetched regional taxes:', taxes.length, 'rates');
      // ✅ Log India's tax rate specifically for debugging
      const indiaTax = taxes.find(t => (t.country_code === 'IND' || t.country_code === 'IN'));
      if (indiaTax) {
        console.log('[TaxManagement] ✅ India tax rate from API:', indiaTax.tax_rate, '%, ID:', indiaTax.id, 'country_code:', indiaTax.country_code);
      } else {
        console.log('[TaxManagement] ⚠️  India tax not found! Available codes:', taxes.map(t => `${t.country_code}:${t.tax_rate}%`));
      }
      // ✅ CRITICAL: Use functional setState to ensure we're setting the latest state
      setRegionalTaxes(prev => {
        console.log('[TaxManagement] setRegionalTaxes called, prev length:', prev.length, 'new length:', taxes.length);
        return taxes; // Replace completely with new data
      });
    } catch (e) {
      console.error('Error fetching regional taxes:', e);
      toast.error('Failed to load regional taxes');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTaxExemptions = async () => {
    try {
      const res = await apiClient.get('/api/tax/exemptions');
      if (res.data?.success) {
        setTaxExemptProducts(res.data.data?.products || []);
      }
    } catch (e) {
      // Endpoint might not exist yet, that's okay
      console.log('Tax exemptions endpoint not available');
    }
  };
  
  const saveTaxSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/tax/settings', taxSettings);
      if (res.data?.success) {
        toast.success('Tax settings saved successfully');
        fetchTaxSettings();
      } else {
        toast.error(res.data?.message || 'Failed to save tax settings');
      }
    } catch (e) {
      console.error('Error saving tax settings:', e);
      toast.error(e.response?.data?.message || 'Failed to save tax settings');
    } finally {
      setLoading(false);
    }
  };
  
  const saveRegionalTax = async () => {
    if (!taxForm.country_code) {
      toast.error('Please select a country');
      return;
    }
    
    setLoading(true);
    try {
      const existingTax = regionalTaxes.find(t => 
        t.country_code === taxForm.country_code.toUpperCase() &&
        (!taxForm.state_code || t.state_code === taxForm.state_code.toUpperCase())
      );
      
      let response;
      if (existingTax) {
        // Update existing
        response = await apiClient.put(`/api/tax/rates/${existingTax.id}`, {
          tax_rate: parseFloat(taxForm.tax_rate) || 0,
          tax_name: taxForm.tax_name,
          tax_type: taxForm.tax_type,
          price_inclusive: taxForm.price_inclusive,
          shipping_tax_rate: parseFloat(taxForm.shipping_tax_rate) || 0,
          state_code: taxForm.state_code || null,
          state_name: taxForm.state_name || null
        });
      } else {
        // Create new
        response = await apiClient.post('/api/tax/rates', {
          country_code: taxForm.country_code.toUpperCase(),
          country_name: taxForm.country_name,
          tax_rate: parseFloat(taxForm.tax_rate) || 0,
          tax_name: taxForm.tax_name,
          tax_type: taxForm.tax_type,
          price_inclusive: taxForm.price_inclusive,
          shipping_tax_rate: parseFloat(taxForm.shipping_tax_rate) || 0,
          state_code: taxForm.state_code || null,
          state_name: taxForm.state_name || null
        });
      }
      
      if (response.data?.success) {
        toast.success('Tax rate saved successfully. Recalculating product prices...');
        fetchRegionalTaxes();
        setShowTaxForm(false);
        resetTaxForm();
        
        // Trigger price recalculation
        try {
          await apiClient.post('/api/pricing/recalculate', {
            country_code: taxForm.country_code.toUpperCase()
          });
          toast.success('All product prices recalculated');
        } catch (recalcError) {
          console.error('Recalculation error:', recalcError);
          toast.error('Tax rate saved but price recalculation failed. Please recalculate manually.');
        }
      } else {
        toast.error(response.data?.message || 'Failed to save tax rate');
      }
    } catch (e) {
      console.error('Error saving regional tax:', e);
      toast.error(e.response?.data?.message || 'Failed to save regional tax');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTaxRate = async (taxId) => {
    if (!window.confirm('Are you sure you want to delete this tax rate?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.delete(`/api/tax/rates/${taxId}`);
      if (response.data?.success) {
        toast.success('Tax rate deleted successfully');
        fetchRegionalTaxes();
      } else {
        toast.error(response.data?.message || 'Failed to delete tax rate');
      }
    } catch (e) {
      console.error('Error deleting tax rate:', e);
      toast.error(e.response?.data?.message || 'Failed to delete tax rate');
    } finally {
      setLoading(false);
    }
  };
  
  const editTaxRate = (tax) => {
    setEditingTax(tax);
    setTaxForm({
      country_code: tax.country_code,
      country_name: tax.country_name,
      tax_rate: tax.tax_rate || 0,
      tax_name: tax.tax_name || 'GST',
      tax_type: tax.tax_type || 'GST',
      price_inclusive: tax.price_inclusive || false,
      shipping_tax_rate: tax.shipping_tax_rate || 0,
      state_code: tax.state_code || '',
      state_name: tax.state_name || ''
    });
    setShowTaxForm(true);
  };
  
  const resetTaxForm = () => {
    setTaxForm({
      country_code: '',
      country_name: '',
      tax_rate: 0,
      tax_name: 'GST',
      tax_type: 'GST',
      price_inclusive: false,
      shipping_tax_rate: 0,
      state_code: '',
      state_name: ''
    });
    setEditingTax(null);
  };
  
  const openAddTaxForm = () => {
    resetTaxForm();
    setShowTaxForm(true);
  };
  
  const handleCountrySelect = (countryCode) => {
    const country = countries.find(c => c.country_code === countryCode);
    if (country) {
      setTaxForm({
        ...taxForm,
        country_code: country.country_code,
        country_name: country.country_name
      });
    }
  };
  
  const recalculateAllPrices = async () => {
    setRecalculating(true);
    try {
      let totalRecalculated = 0;
      for (const country of countries) {
        try {
          await apiClient.post('/api/pricing/recalculate', {
            country_code: country.country_code
          });
          totalRecalculated++;
        } catch (e) {
          console.error(`Error recalculating for ${country.country_code}:`, e);
        }
      }
      toast.success(`✅ Recalculated prices for ${totalRecalculated} countries.`);
    } catch (e) {
      toast.error('Failed to recalculate all prices');
    } finally {
      setRecalculating(false);
    }
  };
  
  const searchExemptionProducts = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setExemptionProducts([]);
      return;
    }
    
    try {
      const res = await apiClient.get('/api/products/', {
        params: { search: searchTerm, per_page: 20 }
      });
      const productsList = res.data?.data?.products || res.data?.products || [];
      setExemptionProducts(productsList);
    } catch (e) {
      console.error('Error searching products:', e);
    }
  };
  
  const toggleProductExemption = async (productId, isExempt) => {
    try {
      const res = await apiClient.post(`/api/tax/exemptions/${productId}`, {
        is_exempt: isExempt
      });
      if (res.data?.success) {
        toast.success(`Product ${isExempt ? 'marked as tax-exempt' : 'removed from tax exemptions'}`);
        fetchTaxExemptions();
      }
    } catch (e) {
      console.error('Error toggling exemption:', e);
      toast.error('Failed to update tax exemption');
    }
  };
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Tax Management</h1>
          <p className="page-subtitle">
            Manage regional tax rates and tax settings (Shopify-style)
          </p>
        </div>
      </div>
      
      {/* Tax Settings Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSettings />
            Tax Settings
          </h3>
          <p style={{ color: isDark ? '#8b949e' : '#666', fontSize: '14px', marginTop: '4px' }}>
            Configure how taxes are calculated and displayed
          </p>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={taxSettings.tax_inclusive_pricing}
                  onChange={(e) => setTaxSettings({ ...taxSettings, tax_inclusive_pricing: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '500' }}>Tax-inclusive pricing</span>
              </label>
              <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginLeft: '26px', marginTop: '4px' }}>
                Prices include tax (like EU VAT). Uncheck for tax-exclusive pricing (like US sales tax).
              </p>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={taxSettings.show_tax_in_cart}
                  onChange={(e) => setTaxSettings({ ...taxSettings, show_tax_in_cart: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '500' }}>Show tax in cart</span>
              </label>
              <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginLeft: '26px', marginTop: '4px' }}>
                Display tax breakdown in shopping cart
              </p>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={taxSettings.show_tax_on_product}
                  onChange={(e) => setTaxSettings({ ...taxSettings, show_tax_on_product: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '500' }}>Show tax on product pages</span>
              </label>
              <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginLeft: '26px', marginTop: '4px' }}>
                Display tax information on product detail pages
              </p>
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  checked={taxSettings.automatic_tax_calculation}
                  onChange={(e) => setTaxSettings({ ...taxSettings, automatic_tax_calculation: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '500' }}>Automatic tax calculation</span>
              </label>
              <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginLeft: '26px', marginTop: '4px' }}>
                Automatically calculate tax based on customer location
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={saveTaxSettings}
              disabled={loading}
            >
              <FiSave style={{ marginRight: '8px' }} />
              Save Tax Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Regional Tax Rates Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiGlobe />
              Regional Tax Rates
            </h3>
            <p style={{ color: isDark ? '#8b949e' : '#666', fontSize: '14px', marginTop: '4px' }}>
              Set tax rates for different countries and regions. Taxes are calculated automatically based on customer location.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn"
              onClick={recalculateAllPrices}
              disabled={recalculating || countries.length === 0}
              style={{
                background: isDark ? '#1f6feb' : '#0366d6',
                color: 'white',
                border: 'none'
              }}
            >
              <FiRefreshCw 
                style={{ 
                  marginRight: '8px',
                  animation: recalculating ? 'spin 1s linear infinite' : 'none'
                }} 
              />
              {recalculating ? 'Recalculating...' : 'Recalculate All Prices'}
            </button>
            <button
              className="btn btn-primary"
              onClick={openAddTaxForm}
            >
              <FiPlus style={{ marginRight: '8px' }} />
              Add Tax Rate
            </button>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#8b949e' : '#64748b' }}>
              Loading tax rates...
            </div>
          ) : (
            <div>
              {/* Tax Rates Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                {countries
                  .filter(c => c.is_active !== false)
                  .filter((country, index, self) => 
                    // Additional deduplication: keep only first occurrence of each country_code
                    index === self.findIndex(c => 
                      c.country_code && 
                      country.country_code && 
                      c.country_code.toUpperCase() === country.country_code.toUpperCase()
                    )
                  )
                  .map(country => {
                  // Normalize country code for matching (handle both 2 and 3 letter codes)
                  const normalizeCountryCode = (code) => {
                    if (!code) return '';
                    const codeMap = {
                      'IND': 'IN', 'USA': 'US', 'GBR': 'GB', 'DEU': 'DE', 'FRA': 'FR',
                      'CAN': 'CA', 'AUS': 'AU', 'ARE': 'AE', 'SAU': 'SA', 'JPN': 'JP',
                      'CHN': 'CN', 'BRA': 'BR', 'ESP': 'ES', 'CHE': 'CH', 'ZAF': 'ZA', 'NZL': 'NZ',
                      'EU': 'EU'
                    };
                    const upperCode = code.toUpperCase();
                    return codeMap[upperCode] || (upperCode.length >= 2 ? upperCode.substring(0, 2) : upperCode);
                  };
                  
                  const normalizedCountryCode = normalizeCountryCode(country.country_code);
                  
                  // Find matching tax rate - try multiple matching strategies
                  // ✅ CRITICAL: Use regionalTaxes from state (not closure) to ensure latest data
                  const existingTax = regionalTaxes.find(t => {
                    if (!t || !t.country_code) return false;
                    const normalizedTaxCode = normalizeCountryCode(t.country_code);
                    const originalCountryCode = country.country_code.toUpperCase();
                    const originalTaxCode = t.country_code.toUpperCase();
                    
                    // Match by normalized codes
                    if (normalizedTaxCode === normalizedCountryCode) return true;
                    // Match by original codes (exact match)
                    if (originalTaxCode === originalCountryCode) return true;
                    // Match 3-letter to 2-letter (e.g., 'IND' matches 'IN', 'AUS' matches 'AU')
                    if (normalizedTaxCode === normalizedCountryCode) return true;
                    // Match if one is substring of another (e.g., 'US' matches 'USA', 'IN' matches 'IND')
                    if (originalTaxCode.startsWith(originalCountryCode) || originalCountryCode.startsWith(originalTaxCode)) return true;
                    return false;
                  });
                  
                  // ✅ Calculate currentRate from the found tax OR fallback to country default
                  const currentRate = existingTax ? (existingTax.tax_rate || 0) : (country.default_tax_rate || 0);
                  
                  // ✅ Debug logging for India specifically
                  if (country.country_code === 'IND' || country.country_code === 'IN') {
                    console.log('[TaxManagement] India - existingTax:', existingTax, 'currentRate:', currentRate, 'regionalTaxes count:', regionalTaxes.length);
                  }
                  
                  // Get applicable tax rates for this country
                  const getApplicableRates = (countryCode) => {
                    const twoLetterCode = normalizeCountryCode(countryCode);
                    
                    const countryRates = {
                      'IN': [0, 5, 12, 18, 28],
                      'US': [0, 5, 7, 8, 10],
                      'GB': [0, 5, 20],
                      'DE': [0, 7, 19],
                      'FR': [0, 5.5, 10, 20],
                      'CA': [0, 5, 13, 15],
                      'AU': [0, 10],
                      'AE': [0, 5],
                      'SA': [0, 5, 15],
                      'JP': [0, 8, 10],
                      'CN': [0, 6, 9, 13],
                      'BR': [0, 7, 12, 18],
                      'ES': [0, 4, 10, 21],
                      'CH': [0, 2.5, 7.7],
                      'ZA': [0, 15],
                      'NZ': [0, 15],
                    };
                    return countryRates[twoLetterCode] || [0, 5, 10, 15, 18, 20, 25];
                  };
                  
                  const applicableRates = getApplicableRates(country.country_code);
                  
                  return (
                    <div
                      key={country.id || country.country_code}
                      style={{
                        padding: '12px',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        background: isDark ? '#161b22' : '#ffffff'
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        marginBottom: '6px',
                        fontSize: '13px',
                        color: isDark ? '#e6edf3' : '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <FiMapPin style={{ fontSize: '14px' }} />
                        {country.country_name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: isDark ? '#8b949e' : '#64748b',
                        marginBottom: '8px'
                      }}>
                        {country.country_code}
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '11px', 
                          marginBottom: '3px',
                          color: isDark ? '#8b949e' : '#64748b'
                        }}>
                          Tax Rate
                        </label>
                        <select
                          className="form-select"
                          value={currentRate}
                          onChange={async (e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            try {
                              // Use normalized country code for API calls (2-letter format)
                              const apiCountryCode = normalizedCountryCode;
                              
                              let updateResponse;
                              // ✅ CRITICAL FIX: Only try to UPDATE if existingTax.id exists and is a valid TaxCountry.id
                              // If id is None or doesn't exist in TaxCountry, CREATE instead
                              if (existingTax && existingTax.id) {
                                // Update existing tax rate (existingTax.id must be a TaxCountry.id, not Country.id)
                                updateResponse = await apiClient.put(`/api/tax/rates/${existingTax.id}`, {
                                  tax_rate: newRate,
                                  tax_name: existingTax.tax_name || 'GST',
                                  tax_type: existingTax.tax_type || 'GST',
                                  country_code: apiCountryCode, // Ensure normalized code is used
                                  country_name: country.country_name
                                });
                                console.log('[TaxManagement] Update response:', updateResponse.data);
                              } else {
                                // Create new tax rate
                                updateResponse = await apiClient.post('/api/tax/rates', {
                                  country_code: apiCountryCode,
                                  country_name: country.country_name,
                                  tax_rate: newRate,
                                  tax_name: 'GST',
                                  tax_type: 'GST'
                                });
                              }
                              
                              // ✅ CRITICAL: Immediately update local state with response data
                              // Backend returns { success: true, data: { id, country_code, tax_rate, ... } }
                              console.log('[TaxManagement] Full update response:', JSON.stringify(updateResponse?.data, null, 2));
                              const updatedTaxData = updateResponse?.data?.data;
                              if (updatedTaxData) {
                                const updatedTax = updatedTaxData.tax || updatedTaxData; // Handle both structures
                                const finalTaxRate = updatedTax.tax_rate || newRate;
                                console.log('[TaxManagement] Extracted updatedTax:', updatedTax, 'finalTaxRate:', finalTaxRate);
                                
                                setRegionalTaxes(prev => {
                                  // ✅ Match by ID first, then by country_code (handling both 2-letter and 3-letter)
                                  const normalizedMatch = (code1, code2) => {
                                    if (code1 === code2) return true;
                                    const map = {'IN': 'IND', 'IND': 'IN', 'AU': 'AUS', 'AUS': 'AU', 'US': 'USA', 'USA': 'US'};
                                    return (map[code1] === code2) || (map[code2] === code1);
                                  };
                                  
                                  const updated = prev.map(t => {
                                    // Match by ID (most reliable)
                                    if (t.id === updatedTax.id) {
                                      console.log('[TaxManagement] ✅ Matched by ID:', t.id, 'updating tax_rate to:', finalTaxRate);
                                      return { ...t, tax_rate: finalTaxRate };
                                    }
                                    // Match by country code (handling normalization)
                                    if (normalizedMatch((t.country_code || '').toUpperCase(), (updatedTax.country_code || '').toUpperCase())) {
                                      console.log('[TaxManagement] ✅ Matched by country_code:', t.country_code, 'vs', updatedTax.country_code, 'updating tax_rate to:', finalTaxRate);
                                      return { ...t, tax_rate: finalTaxRate };
                                    }
                                    return t;
                                  });
                                  
                                  // If not found, add it
                                  if (!updated.find(t => t.id === updatedTax.id || normalizedMatch((t.country_code || '').toUpperCase(), (updatedTax.country_code || '').toUpperCase()))) {
                                    console.log('[TaxManagement] Adding new tax entry:', updatedTax);
                                    updated.push({ ...updatedTax, tax_rate: finalTaxRate });
                                  }
                                  
                                  // ✅ Log India's tax rate after update for debugging
                                  const indiaTaxAfterUpdate = updated.find(t => normalizedMatch((t.country_code || '').toUpperCase(), 'IND'));
                                  console.log('[TaxManagement] ✅ Updated regionalTaxes state. India tax_rate:', indiaTaxAfterUpdate?.tax_rate || 'NOT FOUND');
                                  
                                  return updated;
                                });
                              } else {
                                // If response doesn't have data, just update by ID from existingTax
                                if (existingTax?.id) {
                                  console.log('[TaxManagement] ⚠️  No data in response, updating by ID:', existingTax.id, 'to:', newRate);
                                  setRegionalTaxes(prev => prev.map(t => 
                                    t.id === existingTax.id ? { ...t, tax_rate: newRate } : t
                                  ));
                                }
                              }
                              
                              toast.success(`Tax rate updated for ${country.country_name}`);
                              
                              // ✅ Refresh from server ONCE to ensure sync (don't over-fetch)
                              await fetchRegionalTaxes();
                              
                              // Refresh countries as well
                              await fetchCountries();
                              
                              // Trigger price recalculation
                              try {
                                await apiClient.post('/api/pricing/recalculate', {
                                  country_code: apiCountryCode
                                });
                              } catch (recalcError) {
                                console.error('Recalculation error:', recalcError);
                              }
                            } catch (error) {
                              console.error('Error updating tax rate:', error);
                              const errorMsg = error.response?.data?.message || error.message || 'Failed to update tax rate';
                              toast.error(errorMsg);
                            }
                          }}
                          style={{ 
                            width: '100%', 
                            fontSize: '12px',
                            padding: '6px 8px',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {applicableRates.map(rate => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: isDark ? '#8b949e' : '#64748b',
                        marginBottom: '6px'
                      }}>
                        Current: {currentRate}%
                      </div>
                      {existingTax && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button
                            className="btn"
                            onClick={() => editTaxRate(existingTax)}
                            style={{
                              fontSize: '11px',
                              padding: '3px 6px',
                              background: 'transparent',
                              border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                              color: isDark ? '#8b949e' : '#64748b'
                            }}
                          >
                            <FiEdit style={{ marginRight: '3px', fontSize: '12px' }} />
                            Edit
                          </button>
                          <button
                            className="btn"
                            onClick={() => deleteTaxRate(existingTax.id)}
                            style={{
                              fontSize: '11px',
                              padding: '3px 6px',
                              background: 'transparent',
                              border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                              color: '#ef4444'
                            }}
                          >
                            <FiTrash2 style={{ fontSize: '12px' }} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Info Box */}
              <div style={{
                padding: '16px',
                background: isDark ? '#0d1117' : '#e0f2fe',
                border: `1px solid ${isDark ? '#30363d' : '#bae6fd'}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '4px',
                    color: isDark ? '#e6edf3' : '#0c4a6e'
                  }}>
                    How Shopify-Style Tax Works
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: isDark ? '#8b949e' : '#075985',
                    lineHeight: '1.6'
                  }}>
                    Taxes are calculated automatically based on the customer's shipping address. 
                    Set tax rates for each country/region where you sell. Products marked as tax-exempt 
                    will not be taxed regardless of location. Tax-inclusive pricing means prices already 
                    include tax (common in EU), while tax-exclusive pricing adds tax on top (common in US).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tax Exemptions Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Tax Exemptions</h3>
            <p style={{ color: isDark ? '#8b949e' : '#666', fontSize: '14px', marginTop: '4px' }}>
              Mark products as tax-exempt. These products will not be taxed regardless of location.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowExemptionsModal(true)}
          >
            <FiPlus style={{ marginRight: '8px' }} />
            Manage Exemptions
          </button>
        </div>
        <div className="card-body">
          {taxExemptProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#8b949e' : '#64748b' }}>
              No tax-exempt products. Click "Manage Exemptions" to add products.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {taxExemptProducts.map(product => (
                <div
                  key={product.id}
                  style={{
                    padding: '12px',
                    border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    background: isDark ? '#161b22' : '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '14px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                    {product.name}
                  </span>
                  <button
                    onClick={() => toggleProductExemption(product.id, false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Tax Form Modal */}
      {showTaxForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => {
          setShowTaxForm(false);
          resetTaxForm();
        }}>
          <div style={{
            background: isDark ? '#161b22' : '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: isDark ? '#e6edf3' : '#1e293b'
              }}>
                {editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}
              </h2>
              <button
                onClick={() => {
                  setShowTaxForm(false);
                  resetTaxForm();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: isDark ? '#8b949e' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <FiX />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Country *
                </label>
                <select
                  className="form-select"
                  value={taxForm.country_code}
                  onChange={(e) => handleCountrySelect(e.target.value)}
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">-- Select Country --</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.country_code}>
                      {c.country_name} ({c.country_code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  State/Province (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={taxForm.state_code}
                  onChange={(e) => setTaxForm({ ...taxForm, state_code: e.target.value })}
                  placeholder="e.g., CA, NY, MH"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '4px' }}>
                  Leave blank for country-wide tax rate
                </p>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Tax Rate (%) *
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={taxForm.tax_rate}
                  onChange={(e) => setTaxForm({ ...taxForm, tax_rate: e.target.value })}
                  step="0.01"
                  min="0"
                  max="100"
                  style={{ width: '100%' }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Tax Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={taxForm.tax_name}
                  onChange={(e) => setTaxForm({ ...taxForm, tax_name: e.target.value })}
                  placeholder="e.g., GST, VAT, Sales Tax"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={taxForm.price_inclusive}
                    onChange={(e) => setTaxForm({ ...taxForm, price_inclusive: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Tax-inclusive pricing (prices include tax)</span>
                </label>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Shipping Tax Rate (%)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={taxForm.shipping_tax_rate}
                  onChange={(e) => setTaxForm({ ...taxForm, shipping_tax_rate: e.target.value })}
                  step="0.01"
                  min="0"
                  max="100"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={saveRegionalTax}
                  disabled={loading}
                >
                  <FiSave style={{ marginRight: '8px' }} />
                  {editingTax ? 'Update' : 'Save'} Tax Rate
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setShowTaxForm(false);
                    resetTaxForm();
                  }}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tax Exemptions Modal */}
      {showExemptionsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => setShowExemptionsModal(false)}>
          <div style={{
            background: isDark ? '#161b22' : '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                color: isDark ? '#e6edf3' : '#1e293b'
              }}>
                Manage Tax Exemptions
              </h2>
              <button
                onClick={() => setShowExemptionsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: isDark ? '#8b949e' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <FiX />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input"
                  value={exemptionSearch}
                  onChange={(e) => {
                    setExemptionSearch(e.target.value);
                    searchExemptionProducts(e.target.value);
                  }}
                  placeholder="Search products to mark as tax-exempt..."
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {exemptionProducts.map(product => {
                  const isExempt = taxExemptProducts.some(p => p.id === product.id);
                  return (
                    <div
                      key={product.id}
                      style={{
                        padding: '12px',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{product.name}</span>
                      <button
                        className="btn"
                        onClick={() => toggleProductExemption(product.id, !isExempt)}
                        style={{
                          background: isExempt ? '#ef4444' : '#10b981',
                          color: 'white',
                          border: 'none'
                        }}
                      >
                        {isExempt ? <><FiX style={{ marginRight: '4px' }} /> Remove</> : <><FiCheck style={{ marginRight: '4px' }} /> Add</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxManagement;
