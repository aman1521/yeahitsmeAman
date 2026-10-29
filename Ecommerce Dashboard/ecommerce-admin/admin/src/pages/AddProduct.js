import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  FiSave, 
  FiUpload, 
  FiX, 
  FiPlus,
  FiImage,
  FiPackage,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';
import { useFieldConfig } from '../hooks/useFieldConfig';
import { getApiEndpoint, getApiEndpointSync } from '../services/fieldConfigService';

const AddProduct = () => {
  const { isDark } = useTheme();
  const keyIngredientsConfig = useFieldConfig('key_ingredients');
  const healthBenefitsConfig = useFieldConfig('health_benefits');
  
  // Inject CSS to override font scaling for Add Product page modals
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Overrides for Add Product page modals - Force compact sizes */
        .add-product-container .form-label,
        .add-product-container label.form-label,
        .add-product-container .form-group label {
          font-size: 9px !important;
        }
        .add-product-container .form-input,
        .add-product-container input.form-input,
        .add-product-container .form-select,
        .add-product-container select.form-select {
          font-size: 9px !important;
          padding: 4px 8px !important;
          min-height: 26px !important;
        }
        .add-product-container .form-select option {
          font-size: 9px !important;
        }
        .add-product-container .card-title {
          font-size: 11px !important;
        }
        .add-product-container p {
          font-size: 10px !important;
        }
        .add-product-container h3,
        .add-product-container h4 {
          font-size: 11px !important;
        }
        .add-product-container small {
          font-size: 9px !important;
        }
        .add-product-container button {
          font-size: 10px !important;
          padding: 4px 10px !important;
        }
      `;
      style.id = 'add-product-modal-overrides-styles';
      if (!document.getElementById('add-product-modal-overrides-styles')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('add-product-modal-overrides-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  // Load saved form data from localStorage on mount
  const getInitialFormData = () => {
    try {
      const saved = localStorage.getItem('addProduct_formData');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it's recent (within last 24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data || {};
        }
      }
    } catch (e) {
      console.warn('Could not restore form data:', e);
    }
    // Default form data
    return {
      product_type: 'simple',
      name: '',
      description: '',
      health_benefits: [],
      featured: false,
      sizes: [],
      colors: [],
      regular_price: '',
      sale_price: '',
      sku: '',
      gtin: '',
      track_stock: true,
      stock_status: 'in_stock',
      can_be_grouped: false,
      is_grouped_product: false,
      grouped_products: [],
      regional_prices: [],
      regional_tax_rates: {},
      color_name: '',
      color_shade: '#000000',
      key_ingredients: [],
      feature_cards: [],
      faqs: []
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData);
  
  // Restore other saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('addProduct_formData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log('[AddProduct] Restoring saved form data from', new Date(parsed.timestamp).toLocaleString());
          if (parsed.selectedPricingCountry) {
            setSelectedPricingCountry(parsed.selectedPricingCountry);
          }
          if (parsed.selectedPricingCurrency) {
            setSelectedPricingCurrency(parsed.selectedPricingCurrency);
          }
          if (parsed.productImages) {
            setProductImages(parsed.productImages);
          }
          // Show notification that data was restored
          toast.success('Your previous form data has been restored', { duration: 3000 });
        } else {
          console.log('[AddProduct] Saved form data is too old, not restoring');
        }
      } else {
        console.log('[AddProduct] No saved form data found');
      }
    } catch (e) {
      console.warn('Could not restore additional form state:', e);
    }
  }, []); // Only run on mount
  const [categories, setCategories] = useState([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [healthBenefits, setHealthBenefits] = useState([]);
  const [healthBenefitsLoading, setHealthBenefitsLoading] = useState(true);
  const [keyIngredients, setKeyIngredients] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [selectedPricingCountry, setSelectedPricingCountry] = useState(''); // No default - user must select
  const [selectedPricingCurrency, setSelectedPricingCurrency] = useState({ code: 'INR', symbol: '₹', name: 'Indian Rupee' });
  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [colorError, setColorError] = useState('');
  const [productImages, setProductImages] = useState({
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: ''
  });
  const [keyIngredientImages, setKeyIngredientImages] = useState({});
  
  // Modal states
  const [activeModal, setActiveModal] = useState(null);
  
  // Track if user is manually editing color_name to prevent auto-overwrite
  // Use ref instead of state to avoid re-renders that cause focus loss
  const isManuallyEditingColorNameRef = useRef(false);
  const colorNameInputRef = useRef(null);
  
  // CRITICAL: Separate local state for color_name input - completely isolated from formData
  // This prevents ANY re-renders while typing, which causes focus loss
  const [localColorName, setLocalColorName] = useState('');
  
  // Ref to track if we've attempted to fetch health benefits (prevents infinite loops)
  const healthBenefitsFetchAttempted = useRef(false);
  const healthBenefitsFetchFailed = useRef(false);
  const healthBenefitsAbortController = useRef(null);
  
  // Function to fetch health benefits - can be called on initial load or when modal opens
  // Defined early so it can be used in useEffect hooks and fetchData
  const fetchHealthBenefits = useCallback(async (showErrorToast = false) => {
    // Prevent infinite loops - if we already failed with 401, don't retry
    if (healthBenefitsFetchFailed.current && !showErrorToast) {
      return [];
    }
    
    // Cancel any previous request
    if (healthBenefitsAbortController.current) {
      healthBenefitsAbortController.current.abort();
      healthBenefitsAbortController.current = null;
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    healthBenefitsAbortController.current = abortController;
    
    setHealthBenefitsLoading(true);
    try {
      let healthBenefitsEndpoint = '/health-benefits/'; // Use trailing slash like HealthBenefits.js
      try {
        const endpoint = getApiEndpointSync('health_benefits');
        if (endpoint) {
          healthBenefitsEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
        }
      } catch (e) {
        console.warn('Could not get dynamic endpoint, using default:', e);
        healthBenefitsEndpoint = '/health-benefits/';
      }
      console.log('Fetching health benefits from:', healthBenefitsEndpoint);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        if (showErrorToast) {
          toast.error('Please login to access health benefits');
        }
        setHealthBenefits([]);
        setHealthBenefitsLoading(false);
        healthBenefitsFetchFailed.current = true;
        healthBenefitsAbortController.current = null;
        return [];
      }
      
      // Pass params to get all health benefits (both active and inactive) - matching HealthBenefits.js
      console.log('Making API call to:', healthBenefitsEndpoint);
      console.log('Token exists:', !!token);
      
      // Make the API call with params - don't suppress errors, but apiClient will handle form page 401s gracefully
      const healthBenefitsRes = await apiClient.get(healthBenefitsEndpoint, {
        params: { include_inactive: true }, // Get all health benefits including inactive ones
        signal: abortController.signal  // Add abort signal to cancel request if needed
      });
      
      console.log('Health benefits API response status:', healthBenefitsRes.status);
      console.log('Health benefits API response data:', healthBenefitsRes.data);
      
      // Handle both possible response structures
      const benefits = healthBenefitsRes.data?.health_benefits || healthBenefitsRes.data || [];
      const benefitsArray = Array.isArray(benefits) ? benefits : [];
      console.log('Parsed health benefits array:', benefitsArray);
      console.log('Setting health benefits:', benefitsArray.length, 'items');
      
      if (benefitsArray.length > 0) {
        console.log('First health benefit example:', benefitsArray[0]);
      }
      
      setHealthBenefits(benefitsArray);
      setHealthBenefitsLoading(false);
      healthBenefitsFetchFailed.current = false; // Reset on success
      healthBenefitsAbortController.current = null; // Clear abort controller on success
      return benefitsArray;
    } catch (error) {
      // Don't handle errors if request was aborted
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Health benefits request was canceled');
        return [];
      }
      
      console.error('Error fetching health benefits:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Handle different error types
      if (error.response?.status === 401) {
        healthBenefitsFetchFailed.current = true;
        console.warn('Health benefits fetch failed with 401 - authentication required');
        
        // Check if token exists - if not, user needs to login
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          if (showErrorToast) {
            toast.error('Please login to access health benefits');
          }
        } else {
          // Token exists but is invalid/expired - user needs to refresh or re-login
          if (showErrorToast) {
            toast.error('Session expired. Please refresh the page or login again.', {
              duration: 5000
            });
          }
        }
      } else if (error.response?.status === 404) {
        // Endpoint doesn't exist - this is okay, just show empty list
        console.warn('Health benefits endpoint not found - this is okay');
        healthBenefitsFetchFailed.current = false; // Don't mark as failed for 404
      } else if (showErrorToast) {
        toast.error('Failed to load health benefits. Please try again.');
      }
      
      setHealthBenefits([]);
      setHealthBenefitsLoading(false);
      healthBenefitsAbortController.current = null; // Clear abort controller on error
      return [];
    }
  }, []);
  
  // Sync localColorName with formData.color_name when modal opens
  useEffect(() => {
    if (activeModal === 'product-color') {
      setLocalColorName(formData.color_name || '');
    }
  }, [activeModal, formData.color_name]); // Sync when modal opens or formData.color_name changes externally
  
  // Sync localColorName when color picker auto-populates (but not when user is typing)
  useEffect(() => {
    if (activeModal === 'product-color' && !isManuallyEditingColorNameRef.current) {
      // Only update if formData.color_name changed and it's different from local
      // This happens when color picker auto-populates
      if (formData.color_name && formData.color_name !== localColorName) {
        setLocalColorName(formData.color_name);
      }
    }
  }, [formData.color_shade, formData.color_name]); // When color_shade changes (color picker was used)
  
  // Fetch health benefits when modal opens if they're not loaded
  useEffect(() => {
    // Only fetch if:
    // 1. Modal is open
    // 2. We haven't loaded health benefits yet
    // 3. We're not currently loading
    // 4. We haven't already attempted for this modal opening
    if (
      activeModal === 'health-benefits' && 
      healthBenefits.length === 0 && 
      !healthBenefitsLoading &&
      !healthBenefitsFetchAttempted.current
    ) {
      console.log('Health benefits modal opened, fetching health benefits...');
      healthBenefitsFetchAttempted.current = true;
      fetchHealthBenefits(true); // Show error toast if it fails
    }
    
    // Reset attempt flag when modal closes so it can retry next time
    if (activeModal !== 'health-benefits') {
      healthBenefitsFetchAttempted.current = false;
      healthBenefitsFetchFailed.current = false; // Reset failed flag when modal closes
    }
  }, [activeModal, fetchHealthBenefits]); // Removed healthBenefits.length and healthBenefitsLoading to prevent infinite loops
  
  // Cleanup: Cancel any pending health benefits request on unmount
  useEffect(() => {
    return () => {
      if (healthBenefitsAbortController.current) {
        healthBenefitsAbortController.current.abort();
        healthBenefitsAbortController.current = null;
      }
    };
  }, []);
  
  // Auto-save form data to localStorage to prevent data loss
  // Only save if form has meaningful data (not empty)
  useEffect(() => {
    try {
      // Only save if there's actual content (name, description, or price)
      const hasContent = formData.name?.trim() || 
                        formData.description?.trim() || 
                        formData.regular_price || 
                        formData.sale_price ||
                        formData.sku?.trim() ||
                        (formData.health_benefits && formData.health_benefits.length > 0);
      
      if (!hasContent) {
        // Don't save empty forms
        return;
      }
      
      // Debounce saves to avoid excessive localStorage writes
      const saveTimer = setTimeout(() => {
        try {
          const dataToSave = {
            data: formData,
            selectedPricingCountry,
            selectedPricingCurrency,
            productImages,
            timestamp: Date.now()
          };
          localStorage.setItem('addProduct_formData', JSON.stringify(dataToSave));
          console.log('[AddProduct] Form data auto-saved to localStorage');
        } catch (e) {
          console.error('[AddProduct] Failed to save form data:', e);
        }
      }, 1000); // Save 1 second after last change
      
      return () => clearTimeout(saveTimer);
    } catch (e) {
      console.warn('Could not save form data:', e);
    }
  }, [formData, selectedPricingCountry, selectedPricingCurrency, productImages]);
  
  // Refs for price inputs to prevent rerendering while typing
  const regularPriceInputRef = useRef(null);
  const salePriceInputRef = useRef(null);
  const regularPriceValueRef = useRef('');
  const salePriceValueRef = useRef('');
  const taxRateInputRef = useRef(null);
  const regionalTaxRateRefs = useRef({}); // Store refs for each country's tax rate input
  
  // Price change handlers - use refs to prevent rerendering
  const handleRegularPriceChange = useCallback((e) => {
    const value = e.target.value;
    regularPriceValueRef.current = value;
    // Update ref value directly - no state update to prevent rerender
    if (regularPriceInputRef.current) {
      regularPriceInputRef.current.value = value;
    }
  }, []);

  // Sync regular price to formData on blur
  const handleRegularPriceBlur = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      regular_price: regularPriceValueRef.current
    }));
  }, []);

  const handleSalePriceChange = useCallback((e) => {
    const value = e.target.value;
    salePriceValueRef.current = value;
    // Update ref value directly - no state update to prevent rerender
    if (salePriceInputRef.current) {
      salePriceInputRef.current.value = value;
    }
  }, []);

  // Sync sale price to formData on blur
  const handleSalePriceBlur = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      sale_price: salePriceValueRef.current
    }));
  }, []);

  // Color name change handler - ONLY updates local state, NEVER touches formData while typing
  const handleColorNameChange = useCallback((e) => {
    const value = e.target.value;
    // CRITICAL: Only update local state - this prevents ANY re-renders
    setLocalColorName(value);
    isManuallyEditingColorNameRef.current = true;
    // DO NOT update formData here - that causes re-renders and focus loss
  }, []);
  
  // Sync localColorName to formData ONLY on blur (when user leaves the field)
  const handleColorNameBlur = useCallback((e) => {
    const value = e.target.value;
    // Only now do we update formData - user has finished typing
    setFormData(prev => ({
      ...prev,
      color_name: value
    }));
    setTimeout(() => {
      isManuallyEditingColorNameRef.current = false;
    }, 300);
  }, []);

  // Modal component
  const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
    if (!isOpen) return null;
    
    return (
      <div className="add-product-container" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '12px'
        }} 
        onClick={onClose}
      >
        <div 
          style={{
            backgroundColor: isDark ? '#161b22' : '#fff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: width,
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            zIndex: 10000
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: '12px 14px',
            borderBottom: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: isDark ? '#161b22' : '#fff',
            zIndex: 10,
            borderRadius: '8px 8px 0 0'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: isDark ? '#e6edf3' : '#1e293b' }}>{title}</h3>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: isDark ? '#8b949e' : '#64748b',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = isDark ? '#21262d' : '#f1f5f9'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FiX />
            </button>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {children}
          </div>
        </div>
      </div>
    );
  };
  
  // Section button component with completion indicator
  const SectionButton = ({ icon, title, description, onClick, count = null, completed = false }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 14px',
        background: isDark ? '#161b22' : '#fff',
        border: completed 
          ? `2px solid ${isDark ? '#10b981' : '#10b981'}` 
          : `2px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = completed ? '#10b981' : '#3b82f6';
        e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = completed 
          ? (isDark ? '#10b981' : '#10b981') 
          : (isDark ? '#30363d' : '#e2e8f0');
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        background: completed 
          ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5')
          : (isDark ? '#1f2937' : '#f0f9ff'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: completed ? '#10b981' : '#3b82f6',
        flexShrink: 0,
        position: 'relative'
      }}>
        {icon}
        {completed && (
          <div style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${isDark ? '#161b22' : '#fff'}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
          }}>
            <FiCheck style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: isDark ? '#e6edf3' : '#1e293b' }}>{title}</h4>
          {count !== null && (
            <span style={{
              background: completed ? '#10b981' : '#3b82f6',
              color: '#fff',
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: '500'
            }}>
              {count}
            </span>
          )}
          {completed && (
            <span style={{
              background: '#10b981',
              color: '#fff',
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: '6px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <FiCheck style={{ fontSize: '8px' }} /> Done
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: isDark ? '#8b949e' : '#64748b', lineHeight: '1.3' }}>{description}</p>
      </div>
      <div style={{ color: completed ? '#10b981' : (isDark ? '#8b949e' : '#64748b'), fontSize: '16px' }}>
        {completed ? <FiCheck /> : '→'}
      </div>
    </button>
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('✓ Pricing Currency State Updated:', selectedPricingCurrency);
  }, [selectedPricingCurrency]);

  // Helper function to get standard tax rates for a country
  const getCountryTaxRates = (countryCode) => {
    const taxRatesByCountry = {
      'IND': [0, 5, 12, 18, 28], // India GST rates
      'ARE': [0, 5], // UAE VAT rates
      'USA': [0, 5, 7, 10], // US sales tax rates
      'DEU': [0, 7, 19], // Germany VAT rates
      'ESP': [0, 10, 21], // Spain VAT rates
      'GBR': [0, 5, 20], // UK VAT rates
      'CAN': [0, 5, 13, 15], // Canada GST/HST rates
    };
    
    return taxRatesByCountry[countryCode] || [0, 5, 10, 15, 18]; // Default rates
  };

  // Helper function to get contrasting text color (black or white) based on background color
  const getContrastColor = (hexColor) => {
    if (!hexColor || hexColor === '#') return '#000000';
    
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Helper function to get color name from hex code
  const getColorNameFromHex = (hexCode) => {
    if (!hexCode || !hexCode.startsWith('#')) return null;
    
    const hex = hexCode.toUpperCase();
    const colorMap = {
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#F0EBEB': 'Ivory',
      '#FF0000': 'Red',
      '#0000FF': 'Blue',
      '#008000': 'Green',
      '#FFFF00': 'Yellow',
      '#FFA500': 'Orange',
      '#800080': 'Purple',
      '#FFC0CB': 'Pink',
      '#A52A2A': 'Brown',
      '#808080': 'Gray',
      '#000080': 'Navy Blue',
      '#ADD8E6': 'Light Blue',
      '#00008B': 'Dark Blue',
      '#D3D3D3': 'Light Gray',
      '#A9A9A9': 'Dark Gray',
      '#F5F5DC': 'Beige',
      '#800000': 'Maroon',
      '#008080': 'Teal',
      '#00FFFF': 'Cyan',
      '#FF00FF': 'Magenta',
      '#FFD700': 'Gold',
      '#C0C0C0': 'Silver',
      '#6B6B76': 'Slate Gray', // Added based on user's example
    };
    
    return colorMap[hex] || null;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }
      
      // Fetch real categories from API
      if (token) {
        try {
          const categoriesResponse = await apiClient.get('/products/categories', {
            params: { include_inactive: false }
          });
          setCategories(categoriesResponse.data.categories || []);
          console.log('Fetched categories:', categoriesResponse.data.categories);
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to empty array
          setCategories([]);
        }
      }
      
      setSizes([
        { id: 1, name: 'S' },
        { id: 2, name: 'M' },
        { id: 3, name: 'L' },
        { id: 4, name: 'XL' }
      ]);
      
      setColors([
        { id: 1, name: 'Red' },
        { id: 2, name: 'Black' },
        { id: 3, name: 'White' },
        { id: 4, name: 'Blue' }
      ]);

      // Fetch existing products for grouping
      if (token) {
        try {
          const response = await apiClient.get('/products/');
          setExistingProducts(response.data.products || []);
        } catch (error) {
          console.error('Error fetching products:', error);
          setExistingProducts([]);
        }

        // Fetch countries and currencies for regional pricing
        // Only fetch ACTIVE countries (not inactive) to avoid duplicates
        try {
          const { fetchCountriesAndCurrencies: fetchUtil } = await import('../utils/countryCurrencyUtils');
          const { countries, currencies } = await fetchUtil(false); // Only active countries
          
          setCountries(countries);
          setCurrencies(currencies);
          console.log(`[AddProduct] Loaded ${countries.length} unique countries and ${currencies.length} currencies`);
        } catch (error) {
          console.error('Error fetching countries/currencies:', error);
          setCountries([]);
          setCurrencies([]);
        }
        
        // Fetch health benefits using the reusable function
        // Don't suppress errors on initial load so we can see what's wrong
        console.log('Fetching health benefits on initial page load...');
        await fetchHealthBenefits(true); // Show errors on initial load to debug
        
        // Fetch key ingredients using dynamic endpoint
        try {
          let keyIngredientsEndpoint = '/key-ingredients';
          try {
            const endpoint = await getApiEndpoint('key_ingredients');
            keyIngredientsEndpoint = endpoint || '/key-ingredients';
          } catch (e) {
            console.warn('Could not get dynamic endpoint, using default:', e);
            keyIngredientsEndpoint = '/key-ingredients';
          }
          const keyIngredientsRes = await apiClient.get(keyIngredientsEndpoint, {
            params: { is_active: true },
            suppressErrorToast: true  // Don't show toast for background requests
          });
          setKeyIngredients(keyIngredientsRes.data.key_ingredients || []);
          console.log('Fetched key ingredients:', keyIngredientsRes.data.key_ingredients);
        } catch (error) {
          console.error('Error fetching key ingredients:', error);
          setKeyIngredients([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for color picker
    if (type === 'color') {
      setFormData(prev => ({
        ...prev,
        color_shade: value.toUpperCase()
      }));
      setColorError('');
      console.log('[Color Picker] Selected:', value.toUpperCase());
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePricingCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedPricingCountry(countryCode);
    
    console.log('Country selected:', countryCode);
    console.log('Available countries:', countries);
    console.log('Available currencies:', currencies);
    
    // Find country's currency (use country_code field from backend)
    const country = countries.find(c => c.country_code === countryCode);
    console.log('Found country:', country);
    
    if (country) {
      // Get currency code from country
      const currencyCode = country.currency_code;
      console.log('Currency code from country:', currencyCode);
      
      if (currencyCode) {
        // Find currency details (use currency_code, currency_name, currency_symbol from API)
        const currency = currencies.find(c => c.currency_code === currencyCode);
        console.log('Found currency:', currency);
        
        if (currency) {
          setSelectedPricingCurrency({
            code: currency.currency_code,
            symbol: currency.currency_symbol,
            name: currency.currency_name
          });
          console.log(`✓ Pricing updated: ${country.country_name} → ${currency.currency_symbol} ${currency.currency_code}`);
        } else {
          // Currency not found in currencies list, fallback
          console.warn('Currency not in list, using fallback');
          setSelectedPricingCurrency({
            code: currencyCode,
            symbol: '$',
            name: currencyCode
          });
        }
      }
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSizeChange = (sizeId) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter(id => id !== sizeId)
        : [...prev.sizes, sizeId]
    }));
  };

  const handleColorChange = (colorId) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(id => id !== colorId)
        : [...prev.colors, colorId]
    }));
  };

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedMainCategoryId(value);
    setSelectedSubCategoryId('');
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCategoryId(e.target.value);
  };

  const getSubcategories = (parentId) => {
    if (!parentId) return [];
    const numericId = Number(parentId);
    return categories.filter(cat => cat.parent_id !== null && Number(cat.parent_id) === numericId);
  };

  const mainCategories = categories.filter(cat => cat.parent_id == null);
  const subcategories = getSubcategories(selectedMainCategoryId);
  const selectedMainCategory = mainCategories.find(cat => cat.id === Number(selectedMainCategoryId));

  const handleAddGroupedProduct = (productId) => {
    const product = existingProducts.find(p => p.id === productId);
    if (product && !formData.grouped_products.find(p => p.id === productId)) {
      setFormData(prev => ({
        ...prev,
        grouped_products: [...prev.grouped_products, {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.base_price || product.price || 0,
          quantity: 1
        }]
      }));
    }
  };

  const handleRemoveGroupedProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      grouped_products: prev.grouped_products.filter(p => p.id !== productId)
    }));
  };

  const handleGroupedProductQuantityChange = (productId, quantity) => {
    setFormData(prev => ({
      ...prev,
      grouped_products: prev.grouped_products.map(p => 
        p.id === productId ? { ...p, quantity: parseInt(quantity) || 1 } : p
      )
    }));
  };

  const handleAddRegionalPrice = () => {
    setFormData(prev => ({
      ...prev,
      regional_prices: [...prev.regional_prices, {
        country_code: '',
        currency_code: '',
        regular_price: '',
        sale_price: ''
      }]
    }));
  };

  const handleRemoveRegionalPrice = (index) => {
    setFormData(prev => ({
      ...prev,
      regional_prices: prev.regional_prices.filter((_, i) => i !== index)
    }));
  };

  const handleRegionalPriceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      regional_prices: prev.regional_prices.map((price, i) => 
        i === index ? { ...price, [field]: value } : price
      )
    }));
  };

  const handleFeaturedImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
    }
  };

  const handleGalleryImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast.error('Product name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.regular_price || parseFloat(formData.regular_price) <= 0) {
        toast.error('Valid regular price is required');
        setLoading(false);
        return;
      }
      
      // Validate that at least one health benefit is selected
      if (formData.health_benefits.length === 0) {
        toast.error('Please select at least one health benefit category');
        setLoading(false);
        return;
      }
      
      // Validate color shade if color name is provided
      if (formData.color_name && formData.color_shade) {
        const hexPattern = /^#[0-9A-F]{6}$/i;
        if (!hexPattern.test(formData.color_shade)) {
          toast.error('Invalid color hex code. Use format: #FF0000');
          setLoading(false);
          return;
        }
      }
      
      console.log('✅ Form validation passed');
      console.log('Color data:', { color_name: formData.color_name, color_shade: formData.color_shade });
      
      // Transform form data to match backend API
      const finalCategoryId = selectedSubCategoryId
        ? Number(selectedSubCategoryId)
        : selectedMainCategoryId
          ? Number(selectedMainCategoryId)
          : null;

      if (!finalCategoryId) {
        toast.error('Please select a category for this product');
        setLoading(false);
        return;
      }

      // Prepare product data - ensure proper data types and handle empty values
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null, // Backend expects null for empty
        short_description: formData.description?.trim() ? formData.description.trim().substring(0, 200) : null,
        base_price: parseFloat(formData.regular_price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        // Regional Pricing Info
        base_currency: selectedPricingCurrency.code,
        pricing_country: selectedPricingCountry,
        pricing_currency: selectedPricingCurrency.code,
        sku: formData.sku?.trim() || null, // Backend will auto-generate if null
        stock_quantity: formData.track_stock ? 100 : 0,
        min_order_quantity: formData.min_order_quantity || 1,
        max_order_quantity: formData.max_order_quantity || null,
        category_id: finalCategoryId,
        featured: formData.featured || false,
        is_active: true,
        is_taxable: true,
        tax_rate: 0.0, // Default, can be overridden by regional_tax_rates
        product_type: formData.product_type || 'simple',
        can_be_grouped: formData.can_be_grouped || false,
        is_grouped_product: formData.is_grouped_product || false,
        color_name: formData.color_name?.trim() || null,
        color_shade: formData.color_shade || null,
        regional_tax_rates: formData.regional_tax_rates || {},
        health_benefit_ids: Array.isArray(formData.health_benefits) ? formData.health_benefits : [],
        key_ingredients: (formData.key_ingredients || []).filter(ing => ing.name?.trim()).map(ingredient => ({
          name: ingredient.name.trim(),
          description: ingredient.description?.trim() || '',
          image_url: ingredient.image_url?.trim() || ''
        })),
        feature_cards: (formData.feature_cards || []).filter(card => card.card_text?.trim()).map((card, index) => ({
          card_text: card.card_text.trim(),
          card_image_url: card.card_image_url?.trim() || '',
          display_order: index + 1,
          is_active: true
        })),
        reward_points: 0,
        faqs: (formData.faqs || []).filter(faq => faq && (faq.question?.trim() || faq.answer?.trim())).map((faq, index) => ({
          question: faq.question?.trim() || '',
          answer: faq.answer?.trim() || '',
          display_order: faq.display_order || index
        })),
        image1: productImages.image1?.trim() || null,
        image2: productImages.image2?.trim() || null,
        image3: productImages.image3?.trim() || null,
        image4: productImages.image4?.trim() || null,
        image5: productImages.image5?.trim() || null
      };
      
      console.log('Creating product with regional pricing:', {
        country: selectedPricingCountry,
        currency: selectedPricingCurrency.code,
        regular_price: formData.regular_price,
        sale_price: formData.sale_price
      });
      
      console.log('Sending product data:', productData);
      
      const response = await apiClient.post('/products/', productData);
      const createdProduct = response.data.product || response.data;

      // If this is a grouped product, automatically create packs for each grouped product
      if (formData.is_grouped_product && formData.grouped_products && formData.grouped_products.length > 0) {
        try {
          console.log('Creating packs for grouped products...');
          
          // Create a pack for each product in the group
          // Each pack represents the grouped product with different quantities/discounts
          for (const groupedProduct of formData.grouped_products) {
            try {
              // Calculate discount based on quantity (more quantity = more discount)
              // Default discount: 5% for 1, 10% for 2, 15% for 3, 20% for 4+
              const quantity = groupedProduct.quantity || 1;
              let discountPercentage = 5;
              if (quantity >= 4) discountPercentage = 20;
              else if (quantity >= 3) discountPercentage = 15;
              else if (quantity >= 2) discountPercentage = 10;
              
              const packData = {
                product_id: groupedProduct.id,
                name: `${groupedProduct.name} - Pack of ${quantity}`,
                bottles: quantity, // Use quantity as bottles
                tablets: 0,
                months: 1,
                discount_percentage: discountPercentage,
                badge: 'GROUP PACK',
                display_order: 0,
                is_active: true
              };
              
              try {
                const packResponse = await apiClient.post('/product-packs', packData);
                console.log(`✅ Successfully created pack for ${groupedProduct.name}:`, packResponse.data);
              } catch (packErr) {
                // Log the error but don't fail the whole product creation
                console.error(`❌ Failed to create pack for ${groupedProduct.name}:`, packErr);
                console.error('Pack creation error details:', packErr.response?.data || packErr.message);
                console.error('Pack data that was sent:', packData);
                // Show a warning but continue - don't block product creation
                toast.error(`Warning: Could not create pack for ${groupedProduct.name}. ${packErr.response?.data?.error || packErr.message}`, { duration: 6000 });
              }
            } catch (packError) {
              console.warn(`Could not create pack for product ${groupedProduct.id}:`, packError);
              // Don't fail the whole operation if pack creation fails
            }
          }
          
          toast.success(`Product created! ${formData.grouped_products.length} pack(s) created automatically.`);
        } catch (error) {
          console.error('Error creating packs for grouped products:', error);
          toast.success('Product created successfully! (Packs creation skipped)');
        }
      } else {
        toast.success('Product created successfully!');
      }
      
      // Clear saved form data from localStorage on successful creation
      try {
        localStorage.removeItem('addProduct_formData');
      } catch (e) {
        console.warn('Could not clear saved form data:', e);
      }
      
      // Trigger immediate notification refresh
      window.dispatchEvent(new Event('productCreated'));
      // Reset form
      setFormData({
        product_type: 'simple',
        name: '',
        description: '',
        health_benefits: [],
        featured: false,
        sizes: [],
        colors: [],
        regular_price: '',
        sale_price: '',
        sku: '',
        gtin: '',
        track_stock: true,
        stock_status: 'in_stock',
        can_be_grouped: false,
        is_grouped_product: false,
        grouped_products: [],
        regional_prices: [],
        regional_tax_rates: {},
        color_name: '',
        color_shade: '#000000',
        key_ingredients: [],
        feature_cards: [],
        faqs: []
      });
      setFeaturedImage(null);
      setGalleryImages([]);
      setKeyIngredientImages({});
      setProductImages({
        image1: '',
        image2: '',
        image3: '',
        image4: '',
        image5: ''
      });
      setSelectedMainCategoryId('');
      setSelectedSubCategoryId('');
    } catch (error) {
      console.error('Error creating product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Show specific error message from backend
      let errorMessage = 'Failed to create product';
      
      if (error.response?.data) {
        // Try to get detailed error message
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add more context for 500 errors
      if (error.response?.status === 500) {
        errorMessage += ' (Server error - check console for details)';
      }
      
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '10px', fontSize: '11px', color: isDark ? '#8b949e' : '#64748b' }}>
        Dashboard &gt; Products &gt; Add New Product
      </div>

      {/* Header */}
      <div className="card" style={{ padding: '10px 12px' }}>
        <div className="card-header" style={{ padding: '0 0 8px 0', marginBottom: '8px' }}>
          <h2 className="card-title" style={{ fontSize: '14px', color: isDark ? '#f59e0b' : '#f59e0b' }}>Add New Product</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Type */}
        <div className="card" style={{ marginBottom: '10px', padding: '10px 12px' }}>
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select Type</option>
              <option value="simple">Simple Product</option>
              <option value="variable">Variable Product</option>
            </select>
          </div>
          
          {/* Product Type Description */}
          {formData.product_type && (
            <div style={{ 
              marginTop: '10px',
              padding: '8px 10px',
              background: isDark ? 'rgba(88, 166, 255, 0.1)' : '#f8fafc',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`
            }}>
              <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                {formData.product_type === 'simple' && 'Simple Product'}
                {formData.product_type === 'variable' && 'Variable Product'}
              </div>
              <div style={{ fontSize: '10px', color: isDark ? '#8b949e' : '#64748b' }}>
                {formData.product_type === 'simple' && 'A single product with fixed attributes (no variations). Perfect for books, basic electronics, etc.'}
                {formData.product_type === 'variable' && 'A product with multiple variations (size, color, etc.). Each variation can have different pricing and stock.'}
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="card" style={{ marginBottom: '10px', padding: '10px 12px' }}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              name="name"
              defaultValue={formData.name}
              onChange={() => {}} // No-op during typing - prevents rerendering
              onBlur={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              defaultValue={formData.description}
              onChange={() => {}} // No-op during typing - prevents rerendering
              onBlur={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-input form-textarea"
              placeholder="Enter product description"
              rows="3"
            />
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                name="can_be_grouped"
                checked={formData.can_be_grouped}
                onChange={handleChange}
                style={{ width: '14px', height: '14px' }}
              />
              <span>Can be grouped with other products</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <input
                type="checkbox"
                name="is_grouped_product"
                checked={formData.is_grouped_product}
                onChange={handleChange}
                style={{ width: '14px', height: '14px' }}
              />
              <span>This is a grouped product (contains multiple products)</span>
            </label>
          </div>
        </div>

        {/* Quick Access Sections */}
        <div className="card" style={{ marginBottom: '10px', padding: '10px 12px' }}>
          <h3 className="card-title" style={{ fontSize: '12px', marginBottom: '10px', fontWeight: '600' }}>Product Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            <SectionButton
              icon={<FiPackage />}
              title="Categories"
              description="Select product category and subcategory"
              onClick={() => setActiveModal('categories')}
              completed={!!(selectedMainCategoryId || selectedSubCategoryId)}
            />
            <SectionButton
              icon="💰"
              title="Pricing & Currency"
              description="Set base price, sale price, and currency conversion"
              onClick={() => setActiveModal('pricing')}
              completed={!!(formData.regular_price && selectedPricingCountry)}
            />
            <SectionButton
              icon="📊"
              title="Tax Settings"
              description="Configure product tax rates and regional overrides"
              onClick={() => setActiveModal('tax')}
              completed={formData.tax_rate !== null && formData.tax_rate !== undefined && formData.tax_rate !== ''}
            />
            <SectionButton
              icon="🌍"
              title="Regional Tax Rates"
              description="Set country-specific tax rate overrides"
              onClick={() => setActiveModal('regional-tax')}
              completed={Object.keys(formData.regional_tax_rates || {}).length > 0 && Object.values(formData.regional_tax_rates || {}).some(rate => rate !== null && rate !== undefined)}
            />
            <SectionButton
              icon="🧪"
              title={keyIngredientsConfig.displayLabel || keyIngredientsConfig.config?.display_label || 'Key Ingredients'}
              description={`Manage product ${(keyIngredientsConfig.displayLabel || keyIngredientsConfig.config?.display_label || 'ingredients').toLowerCase()} (${formData.key_ingredients.length} added)`}
              count={formData.key_ingredients.length}
              onClick={() => setActiveModal('key-ingredients')}
              completed={formData.key_ingredients.length > 0}
            />
            <SectionButton
              icon="💊"
              title={healthBenefitsConfig.displayLabel || 'Health Benefits'}
              description={`Select ${(healthBenefitsConfig.displayLabel || 'health benefits').toLowerCase()} for this product (${formData.health_benefits.length} selected)`}
              count={formData.health_benefits.length}
              onClick={() => setActiveModal('health-benefits')}
              completed={formData.health_benefits.length > 0}
            />
            <SectionButton
              icon="⭐"
              title="Feature Cards"
              description={`Add product feature cards (${formData.feature_cards.length}/4)`}
              count={formData.feature_cards.length}
              onClick={() => setActiveModal('feature-cards')}
              completed={formData.feature_cards.length > 0}
            />
            <SectionButton
              icon={<FiImage />}
              title="Product Images"
              description="Add up to 5 product image URLs"
              onClick={() => setActiveModal('images')}
              completed={!!(productImages.image1 || productImages.image2 || productImages.image3 || productImages.image4 || productImages.image5)}
            />
            <SectionButton
              icon="🎨"
              title="Product Color"
              description={formData.color_name || formData.color_shade ? `Color: ${formData.color_name || 'Custom'} (${formData.color_shade || 'N/A'})` : 'Set product color name and hex code'}
              onClick={() => setActiveModal('product-color')}
              completed={!!(formData.color_name || (formData.color_shade && formData.color_shade !== '#000000'))}
            />
            <SectionButton
              icon="❓"
              title="FAQs"
              description="Add frequently asked questions"
              onClick={() => setActiveModal('faqs')}
              completed={(formData.faqs || []).some(faq => faq && (faq.question?.trim() || faq.answer?.trim()))}
            />
          </div>
        </div>

        {/* Categories Modal */}
        <Modal
          isOpen={activeModal === 'categories'}
          onClose={() => setActiveModal(null)}
          title="Select Categories"
        >
          <div className="card" style={{ marginBottom: '10px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title" style={{ fontSize: '10px', marginBottom: '6px' }}>Select Categories</h3>
          
          {categories.length === 0 ? (
            <p style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic', fontSize: '11px' }}>Loading categories...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Main Category *</label>
                <select
                  value={selectedMainCategoryId}
                  onChange={handleMainCategoryChange}
                  className="form-select"
                  required
                >
                  <option value="">Select main category</option>
                  {mainCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div className="form-group">
                  <label className="form-label">
                    Subcategory {selectedMainCategory ? `(${selectedMainCategory.name})` : ''}
                  </label>
                  <select
                    value={selectedSubCategoryId}
                    onChange={handleSubCategoryChange}
                    className="form-select"
                  >
                    <option value="">
                      {selectedMainCategory ? `All ${selectedMainCategory.name}` : 'Select subcategory'}
                    </option>
                    {subcategories.map(subcat => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          
          <p style={{ marginTop: '10px', fontSize: '11px', color: isDark ? '#8b949e' : '#64748b' }}>
            Tip: choose a main category first (e.g., Health Supplements). If that category has subcategories,
            you can then pick the specific subcategory such as Essential or Specialized Supplements.
          </p>
          </div>
        </Modal>

        {/* Key Ingredients Modal */}
        <Modal
          isOpen={activeModal === 'key-ingredients'}
          onClose={() => setActiveModal(null)}
          title={keyIngredientsConfig.displayLabel || 'Key Ingredients'}
          width="650px"
        >
          <div className="card" style={{ marginBottom: '12px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title" style={{ fontSize: '12px', marginBottom: '8px' }}>{keyIngredientsConfig.displayLabel || 'Key Ingredients'}</h3>
            <p style={{ fontSize: '11px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '12px' }}>
              {keyIngredientsConfig.config?.labels?.section_description || keyIngredientsConfig.labels?.section_description || 'Add key ingredients for this product. Each ingredient can have a name, description, and image.'}
            </p>
            
            {formData.key_ingredients.map((ingredient, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '8px 10px', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`, borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#f59e0b' : '#f59e0b' }}>
                    {keyIngredientsConfig.displayLabel || 'Key Ingredient'} {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        key_ingredients: prev.key_ingredients.filter((_, i) => i !== index)
                      }));
                      setKeyIngredientImages(prev => {
                        const newImages = { ...prev };
                        delete newImages[index];
                        return newImages;
                      });
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '2px 5px'
                    }}
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label">
                    {(keyIngredientsConfig.config?.labels?.name?.label_value || keyIngredientsConfig.labels?.name?.label_value || 'Ingredient Name')} *
                  </label>
                  <input
                    type="text"
                    defaultValue={ingredient.name || ''}
                    onChange={() => {}} // No-op during typing - prevents rerendering
                    onBlur={(e) => {
                      const newIngredients = [...formData.key_ingredients];
                      newIngredients[index] = { ...newIngredients[index], name: e.target.value };
                      setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                    }}
                    className="form-input"
                    placeholder={keyIngredientsConfig.labels?.name?.placeholder_text || keyIngredientsConfig.config?.labels?.name?.placeholder_text || 'Enter ingredient name...'}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">
                    {keyIngredientsConfig.labels?.description?.label_value || keyIngredientsConfig.config?.labels?.description?.label_value || 'Description'}
                  </label>
                  <textarea
                    defaultValue={ingredient.description || ''}
                    onChange={() => {}} // No-op during typing - prevents rerendering
                    onBlur={(e) => {
                      const newIngredients = [...formData.key_ingredients];
                      newIngredients[index] = { ...newIngredients[index], description: e.target.value };
                      setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                    }}
                    className="form-input"
                    placeholder={keyIngredientsConfig.labels?.description?.placeholder_text || keyIngredientsConfig.config?.labels?.description?.placeholder_text || 'Enter ingredient description...'}
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    {keyIngredientsConfig.labels?.image?.label_value || keyIngredientsConfig.config?.labels?.image?.label_value || 'Ingredient Image URL'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="url"
                        defaultValue={ingredient.image_url || ''}
                        onChange={() => {}} // No-op during typing - prevents rerendering
                        onBlur={(e) => {
                          const newIngredients = [...formData.key_ingredients];
                          newIngredients[index] = { ...newIngredients[index], image_url: e.target.value };
                          setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                        }}
                        className="form-input"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p style={{ fontSize: '9px', color: isDark ? '#8b949e' : '#64748b', marginTop: '3px' }}>
                        Enter the full URL of the ingredient image
                      </p>
                    </div>
                    {ingredient.image_url && (
                      <div style={{ width: '60px', height: '60px', borderRadius: '5px', overflow: 'hidden', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}` }}>
                        <img
                          src={ingredient.image_url}
                          alt={ingredient.name || 'Ingredient'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  key_ingredients: [...prev.key_ingredients, { name: '', description: '', image_url: '' }]
                }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: isDark ? '#21262d' : '#f1f5f9',
                border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: isDark ? '#e6edf3' : '#1e293b',
                fontWeight: '500'
              }}
            >
              <FiPlus />
              {keyIngredientsConfig.labels?.add_button || keyIngredientsConfig.config?.labels?.add_button || 'Add Key Ingredient'}
            </button>
          </div>
        </Modal>

        {/* Health Benefits Modal */}
        <Modal
          isOpen={activeModal === 'health-benefits'}
          onClose={() => setActiveModal(null)}
          title={`Select ${healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'Health Benefits'}`}
          width="600px"
        >
          <div className="card" style={{ marginBottom: '12px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title" style={{ fontSize: '12px', marginBottom: '8px' }}>
              {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'Health Benefits'}
            </h3>
            <p style={{ fontSize: '11px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '12px' }}>
              {healthBenefitsConfig.config?.labels?.section_description || healthBenefitsConfig.labels?.section_description || 'Select health benefits for this product. At least one selection is required.'}
            </p>
            
            {healthBenefitsLoading ? (
              <p style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic' }}>
                Loading {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefits'}...
              </p>
            ) : healthBenefits.length === 0 ? (
              <div>
                {healthBenefitsFetchFailed.current ? (
                  <>
                    <p style={{ color: '#ef4444', fontStyle: 'italic', marginBottom: '15px', fontWeight: '500' }}>
                      ⚠️ Unable to load {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefits'}. 
                      This may be due to authentication. You can continue creating the product and add {healthBenefitsConfig.displayLabel || 'health benefits'} later.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        healthBenefitsFetchFailed.current = false; // Reset failed flag
                        healthBenefitsFetchAttempted.current = false; // Reset attempt flag
                        fetchHealthBenefits(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: isDark ? '#21262d' : '#f1f5f9',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: isDark ? '#e6edf3' : '#1e293b',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🔄 Retry Loading
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic', marginBottom: '15px' }}>
                      No {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefits'} available. Please add some first or try refreshing.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        healthBenefitsFetchFailed.current = false; // Reset failed flag
                        healthBenefitsFetchAttempted.current = false; // Reset attempt flag
                        fetchHealthBenefits(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: isDark ? '#21262d' : '#f1f5f9',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: isDark ? '#e6edf3' : '#1e293b',
                        fontWeight: '500',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🔄 Retry Loading
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  {healthBenefits.map((benefit) => (
                    <label
                      key={benefit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 10px',
                        background: formData.health_benefits.includes(benefit.id)
                          ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5')
                          : (isDark ? '#161b22' : '#f8fafc'),
                        border: formData.health_benefits.includes(benefit.id)
                          ? `2px solid ${isDark ? '#10b981' : '#10b981'}`
                          : `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.health_benefits.includes(benefit.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              health_benefits: [...prev.health_benefits, benefit.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              health_benefits: prev.health_benefits.filter(id => id !== benefit.id)
                            }));
                          }
                        }}
                        style={{ 
                          width: '14px', 
                          height: '14px', 
                          cursor: 'pointer',
                          accentColor: '#10b981'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '10px',
                          color: isDark ? '#e6edf3' : '#1e293b',
                          marginBottom: '3px'
                        }}>
                          {benefit.name}
                        </div>
                        {benefit.description && (
                          <div style={{ 
                            fontSize: '9px', 
                            color: isDark ? '#8b949e' : '#64748b',
                            lineHeight: '1.2'
                          }}>
                            {benefit.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                
                {formData.health_benefits.length === 0 && (
                  <div style={{
                    padding: '12px',
                    background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
                    border: `1px solid ${isDark ? '#f59e0b' : '#f59e0b'}`,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '20px'
                  }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <span style={{ fontSize: '13px', color: isDark ? '#fbbf24' : '#92400e' }}>
                      You must select at least one {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefit'} to categorize this product properly.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>

        {/* Product Color Modal */}
        <Modal
          isOpen={activeModal === 'product-color'}
          onClose={() => setActiveModal(null)}
          title="Product Color"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">Product Color Configuration</h3>
            <p style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>
              Set the product color name and hex code. The color will be stored in the database and displayed on the product page.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Color Name</label>
                <input
                  ref={colorNameInputRef}
                  type="text"
                  name="color_name"
                  value={localColorName}
                  onChange={handleColorNameChange}
                  onFocus={() => {
                    isManuallyEditingColorNameRef.current = true;
                  }}
                  onBlur={handleColorNameBlur}
                  className="form-input"
                  placeholder="e.g., Red, Blue, Green, Multi-color, Navy Blue"
                  autoComplete="off"
                />
                <p style={{ fontSize: '10px', color: isDark ? '#8b949e' : '#64748b', marginTop: '4px' }}>
                  Enter a descriptive name for the color
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Color Shade (Hex Code)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="color"
                      value={formData.color_shade || '#000000'}
                      onChange={(e) => {
                        const hexValue = e.target.value.toUpperCase();
                        const colorName = getColorNameFromHex(hexValue);
                        
                        // Always update color_name when color picker changes if we found a recognized color
                        // Only skip if user is actively typing in the color_name field (has focus)
                        const isColorNameFocused = document.activeElement === colorNameInputRef.current;
                        const shouldUpdateColorName = !isColorNameFocused && colorName;
                        
                        setFormData(prev => ({
                          ...prev, 
                          color_shade: hexValue,
                          // Always update color_name when color picker is used and we found a recognized color
                          color_name: shouldUpdateColorName ? colorName : prev.color_name
                        }));
                        
                        // Update local state if we're auto-populating (so input shows the name immediately)
                        if (shouldUpdateColorName && colorName) {
                          setLocalColorName(colorName);
                        }
                        
                        setColorError('');
                        // Reset manual editing flag after color picker change
                        isManuallyEditingColorNameRef.current = false;
                      }}
                      style={{ 
                        width: '70px', 
                        height: '50px', 
                        border: `2px solid ${isDark ? '#30363d' : '#e2e8f0'}`, 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Click to pick a color"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.color_shade || ''}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      // Add # if missing
                      if (value && !value.startsWith('#')) {
                        value = '#' + value;
                      }
                      // Allow typing # and hex characters
                      if (value === '' || value === '#' || /^#[0-9A-F]{0,6}$/.test(value)) {
                        const colorName = value.length === 7 && /^#[0-9A-F]{6}$/.test(value) 
                          ? getColorNameFromHex(value) 
                          : null;
                        
                        // Only auto-populate if user is not manually editing color_name and we found a match
                        // Also auto-populate if color_name is empty
                        const isColorNameFocused = document.activeElement === colorNameInputRef.current;
                        const shouldUpdateColorName = !isColorNameFocused && colorName && 
                          (!formData.color_name || formData.color_name.trim() === '');
                        
                        setFormData(prev => ({
                          ...prev, 
                          color_shade: value,
                          color_name: shouldUpdateColorName ? colorName : prev.color_name
                        }));
                        
                        // Update local state if we're auto-populating (so input shows the name immediately)
                        if (shouldUpdateColorName && colorName) {
                          setLocalColorName(colorName);
                        }
                        
                        setColorError('');
                        
                        // Validate complete hex code
                        if (value.length === 7 && /^#[0-9A-F]{6}$/.test(value)) {
                          setColorError('');
                        } else if (value.length > 1 && value.length < 7) {
                          setColorError('Hex code must be 6 characters (e.g., #FF0000)');
                        }
                      }
                    }}
                    className="form-input"
                    placeholder="#000000"
                    style={{ 
                      flex: 1,
                      minWidth: '120px',
                      borderColor: colorError ? '#ef4444' : (isDark ? '#30363d' : '#e2e8f0')
                    }}
                    maxLength={7}
                  />
                  <div 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: formData.color_shade || '#000000', 
                      border: `2px solid ${isDark ? '#30363d' : '#e2e8f0'}`, 
                      borderRadius: '8px',
                      boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getContrastColor(formData.color_shade || '#000000'),
                      fontSize: '10px',
                      fontWeight: '600',
                      textAlign: 'center',
                      padding: '2px'
                    }}
                    title={`Preview: ${formData.color_shade || '#000000'}`}
                  >
                    {formData.color_shade || '#000000'}
                  </div>
                </div>
                {colorError && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
                    {colorError}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '5px' }}>
                  Click the color box to pick any color, or type hex code (e.g., #FF0000 for red, #0000FF for blue)
                </p>
              </div>
            </div>

            {/* Color Preview Section */}
            {(formData.color_name || formData.color_shade) && (
              <div style={{ 
                padding: '8px 10px', 
                background: isDark ? 'rgba(88, 166, 255, 0.1)' : '#f0f9ff', 
                borderRadius: '5px',
                border: `2px solid ${isDark ? '#58a6ff' : '#0ea5e9'}`,
                marginTop: '10px'
              }}>
                <h4 style={{ fontSize: '10px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                  Color Preview
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: formData.color_shade || '#000000', 
                      border: `2px solid ${isDark ? '#30363d' : '#e2e8f0'}`, 
                      borderRadius: '6px',
                      boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getContrastColor(formData.color_shade || '#000000'),
                      fontSize: '8px',
                      fontWeight: '700',
                      textAlign: 'center',
                      padding: '3px'
                    }}
                  >
                    {formData.color_shade || '#000000'}
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#e6edf3' : '#1e293b', marginBottom: '2px' }}>
                      {formData.color_name || getColorNameFromHex(formData.color_shade) || 'Custom Color'}
                    </div>
                    <div style={{ fontSize: '9px', color: isDark ? '#8b949e' : '#64748b' }}>
                      Hex: {formData.color_shade || 'Not set'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Color Presets */}
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ fontSize: '10px', fontWeight: '600', marginBottom: '6px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                Quick Color Presets
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {[
                  { name: 'Red', hex: '#FF0000' },
                  { name: 'Blue', hex: '#0000FF' },
                  { name: 'Green', hex: '#00FF00' },
                  { name: 'Yellow', hex: '#FFFF00' },
                  { name: 'Orange', hex: '#FFA500' },
                  { name: 'Purple', hex: '#800080' },
                  { name: 'Pink', hex: '#FFC0CB' },
                  { name: 'Black', hex: '#000000' },
                  { name: 'White', hex: '#FFFFFF' },
                  { name: 'Gray', hex: '#808080' },
                  { name: 'Brown', hex: '#A52A2A' },
                  { name: 'Navy', hex: '#000080' }
                ].map(preset => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        color_name: preset.name,
                        color_shade: preset.hex
                      }));
                      setColorError('');
                    }}
                    style={{
                      padding: '10px',
                      background: isDark ? '#161b22' : '#f8fafc',
                      border: `2px solid ${formData.color_shade === preset.hex ? (isDark ? '#58a6ff' : '#3b82f6') : (isDark ? '#30363d' : '#e2e8f0')}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s'
                    }}
                    title={`${preset.name} - ${preset.hex}`}
                  >
                    <div 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: preset.hex, 
                        borderRadius: '6px',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: isDark ? '#e6edf3' : '#1e293b', fontWeight: '500' }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        {/* Pricing & Currency Modal */}
        <Modal
          isOpen={activeModal === 'pricing'}
          onClose={() => setActiveModal(null)}
          title="Pricing & Currency"
          width="650px"
        >
          <div className="card" style={{ marginBottom: '10px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title" style={{ fontSize: '10px', marginBottom: '6px' }}>Product Pricing</h3>
            <p style={{ fontSize: '9px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '10px' }}>
              Set the base price and sale price for this product. Prices can be set for specific countries.
            </p>
            
            {/* Country Selector for Pricing */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">
                Select Country for Pricing
                <span style={{ fontSize: '9px', color: isDark ? '#8b949e' : '#64748b', marginLeft: '6px' }}>
                  Set prices for specific countries - other countries will use automatic rate conversion
                </span>
              </label>
              <select
                value={selectedPricingCountry}
                onChange={handlePricingCountryChange}
                className="form-select"
                style={{
                  padding: '4px 8px',
                  fontSize: '9px',
                  fontWeight: '500',
                  borderRadius: '5px',
                  backgroundColor: isDark ? '#0d1117' : '#fff',
                  color: isDark ? '#e6edf3' : '#1e293b',
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                  minHeight: '26px'
                }}
              >
                <option value="">Select Country...</option>
                {countries && countries.length > 0 && (() => {
                  // Additional deduplication check - filter by unique country_code
                  const seen = new Set();
                  return countries.filter(country => {
                    const code = country.country_code?.toUpperCase();
                    if (code && !seen.has(code)) {
                      seen.add(code);
                      return true;
                    }
                    return false;
                  }).map((country, index) => (
                    <option key={`country-${country.country_code}`} value={country.country_code}>
                      {country.country_name} - {country.currency_code || 'N/A'}
                    </option>
                  ));
                })()}
              </select>
            </div>

            {selectedPricingCountry && (
              <div style={{
                padding: '8px 10px',
                background: isDark ? 'rgba(88, 166, 255, 0.15)' : '#dbeafe',
                borderRadius: '6px',
                marginBottom: '12px',
                border: `1px solid ${isDark ? '#58a6ff' : '#3b82f6'}`,
                color: isDark ? '#e6edf3' : '#1e293b',
                fontSize: '11px'
              }}>
                <strong>Pricing for:</strong> {countries.find(c => c.country_code === selectedPricingCountry)?.country_name} | 
                <strong style={{ marginLeft: '8px' }}>Currency:</strong> {selectedPricingCurrency.symbol} {selectedPricingCurrency.name} ({selectedPricingCurrency.code})
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  Regular Price ({selectedPricingCurrency.symbol} {selectedPricingCurrency.code}) *
                </label>
                <input
                  ref={regularPriceInputRef}
                  type="number"
                  name="regular_price"
                  defaultValue={formData.regular_price || ''}
                  onChange={handleRegularPriceChange}
                  onBlur={handleRegularPriceBlur}
                  className="form-input"
                  placeholder={`Enter regular price in ${selectedPricingCurrency.code}`}
                  step="0.01"
                  min="0"
                  disabled={!selectedPricingCountry}
                  required
                />
                {!selectedPricingCountry && (
                  <small style={{ color: '#f59e0b', fontSize: '10px' }}>
                    Please select a country first
                  </small>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Sale Price ({selectedPricingCurrency.symbol} {selectedPricingCurrency.code})
                </label>
                <input
                  ref={salePriceInputRef}
                  type="number"
                  name="sale_price"
                  defaultValue={formData.sale_price || ''}
                  onChange={handleSalePriceChange}
                  onBlur={handleSalePriceBlur}
                  className="form-input"
                  placeholder={`Enter sale price in ${selectedPricingCurrency.code}`}
                  step="0.01"
                  min="0"
                  disabled={!selectedPricingCountry}
                />
                {!selectedPricingCountry && (
                  <small style={{ color: '#f59e0b', fontSize: '10px' }}>
                    Please select a country first
                  </small>
                )}
              </div>
            </div>

            {selectedPricingCountry && formData.regular_price && (
              <div style={{
                padding: '12px',
                background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#10b981' : '#10b981'}`,
                fontSize: '13px',
                color: isDark ? '#6ee7b7' : '#065f46'
              }}>
                💡 <strong>Note:</strong> This price ({selectedPricingCurrency.symbol}{formData.regular_price}) will be saved for {countries.find(c => c.country_code === selectedPricingCountry)?.country_name}. 
                Other countries will see auto-converted prices based on current exchange rates.
              </div>
            )}
          </div>
        </Modal>

        {/* Tax Settings Modal */}
        <Modal
          isOpen={activeModal === 'tax'}
          onClose={() => setActiveModal(null)}
          title="Product Tax Settings"
          width="600px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '10px' }}>Product Tax Settings</h3>
            <p className="form-label" style={{ fontSize: '14px', marginBottom: '20px', marginTop: '0', color: isDark ? '#8b949e' : '#64748b' }}>
              Configure default tax settings for this product. These apply globally unless overridden by regional tax rates.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_taxable"
                    checked={formData.is_taxable}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_taxable: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '14px', color: isDark ? '#e6edf3' : '#1e293b' }}>Product is Taxable</span>
                </label>
                <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '5px', marginLeft: '26px' }}>
                  Uncheck if this product is tax-exempt
                </p>
              </div>

              {formData.is_taxable && (
                <div className="form-group">
                  <label className="form-label">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    name="tax_rate"
                    defaultValue={formData.tax_rate || ''}
                    onChange={(e) => {
                      // Use ref to prevent rerendering while typing
                      const value = e.target.value;
                      if (!taxRateInputRef.current) {
                        taxRateInputRef.current = { value: value };
                      } else {
                        taxRateInputRef.current.value = value;
                      }
                    }}
                    onBlur={(e) => {
                      // Sync to formData only on blur
                      setFormData(prev => ({ ...prev, tax_rate: e.target.value }));
                    }}
                    className="form-input"
                    placeholder="e.g., 18 for 18% tax"
                    min="0"
                    max="100"
                    step="0.01"
                    style={{ maxWidth: '200px' }}
                  />
                  <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '5px' }}>
                    This tax rate applies globally. Use regional tax rates to override for specific countries.
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              padding: '12px', 
              background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', 
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#3b82f6' : '#bfdbfe'}`,
              fontSize: '13px',
              color: isDark ? '#93c5fd' : '#1e40af'
            }}>
              <strong>💡 Tax Priority:</strong> Regional Tax Override &gt; Product Tax Rate &gt; Country Default Tax
            </div>
          </div>
        </Modal>

        {/* Regional Tax Rates Modal */}
        <Modal
          isOpen={activeModal === 'regional-tax'}
          onClose={() => setActiveModal(null)}
          title="Regional Tax Rate Overrides"
          width="650px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '10px' }}>Regional Tax Rate Overrides</h3>
            <p className="form-label" style={{ fontSize: '14px', marginBottom: '20px', marginTop: '0', color: isDark ? '#8b949e' : '#64748b' }}>
              Override the product tax rate for specific countries. Leave blank to use the product's default tax rate.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
              {(() => {
                // Deduplicate countries by country_code
                const seen = new Set();
                return countries.filter(country => {
                  const code = country.country_code?.toUpperCase();
                  if (code && !seen.has(code)) {
                    seen.add(code);
                    return true;
                  }
                  return false;
                });
              })().map(country => (
                <div key={country.country_code} style={{ 
                  padding: '15px', 
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`, 
                  borderRadius: '8px',
                  background: isDark ? '#161b22' : '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: isDark ? '#e6edf3' : '#1e293b' }}>{country.country_name}</div>
                      <div style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>{country.country_code}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', fontWeight: '500' }}>
                      Default: {country.default_tax_rate || 0}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      style={{
                        width: '120px',
                        padding: '8px',
                        border: `1px solid ${isDark ? '#30363d' : '#d1d5db'}`,
                        borderRadius: '4px',
                        fontSize: '14px',
                        backgroundColor: isDark ? '#0d1117' : '#fff',
                        color: isDark ? '#e6edf3' : '#1e293b'
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Store in ref to prevent rerendering - update formData on blur
                        if (!regionalTaxRateRefs.current[country.country_code]) {
                          regionalTaxRateRefs.current[country.country_code] = { value: value };
                        } else {
                          regionalTaxRateRefs.current[country.country_code].value = value;
                        }
                      }}
                      onBlur={(e) => {
                        // Sync to formData only on blur to prevent rerendering
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          regional_tax_rates: {
                            ...prev.regional_tax_rates,
                            [country.country_code]: value ? parseFloat(value) : null
                          }
                        }));
                      }}
                      defaultValue={formData.regional_tax_rates?.[country.country_code] ? String(formData.regional_tax_rates[country.country_code]) : ''}
                    >
                      <option value="">Select rate</option>
                      {getCountryTaxRates(country.country_code).map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: isDark ? 'rgba(14, 165, 233, 0.1)' : '#f0f9ff', 
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#0ea5e9' : '#0ea5e9'}`
            }}>
              <div style={{ fontSize: '12px', color: isDark ? '#7dd3fc' : '#0369a1', fontWeight: '500' }}>
                💡 Tip: Set specific tax rates for each region where you sell products. 
                This allows you to comply with local tax regulations and pricing strategies.
              </div>
            </div>
          </div>
        </Modal>

        {/* Product Images Modal */}
        <Modal
          isOpen={activeModal === 'images'}
          onClose={() => setActiveModal(null)}
          title="Product Images"
          width="650px"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">Product Images</h3>
            <p style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>
              Add up to 5 product image URLs. These images will be displayed in product galleries and listings.
            </p>
            
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Image {num} URL</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      defaultValue={productImages[`image${num}`] || ''}
                      onChange={() => {}} // No-op during typing - prevents rerendering
                      onBlur={(e) => {
                        setProductImages(prev => ({
                          ...prev,
                          [`image${num}`]: e.target.value
                        }));
                      }}
                      className="form-input"
                      placeholder={`https://example.com/product-image-${num}.jpg`}
                    />
                    <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '5px' }}>
                      Enter the full URL of the product image
                    </p>
                  </div>
                  {productImages[`image${num}`] && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}` }}>
                      <img
                        src={productImages[`image${num}`]}
                        alt={`Product Image ${num}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* FAQs Modal */}
        <Modal
          isOpen={activeModal === 'faqs'}
          onClose={() => setActiveModal(null)}
          title="Product FAQs"
          width="650px"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">Product FAQs</h3>
            <p style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>
              Add frequently asked questions and answers for this product. You can add unlimited FAQs.
            </p>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} style={{ marginBottom: '25px', padding: '15px', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f59e0b' : '#f59e0b' }}>
                    FAQ {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        faqs: prev.faqs.filter((_, i) => i !== index)
                      }));
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '5px 10px'
                    }}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Question</label>
                  <input
                    type="text"
                    defaultValue={faq.question || ''}
                    onChange={() => {}} // No-op during typing - prevents rerendering
                    onBlur={(e) => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        faqs: newFaqs
                      }));
                    }}
                    className="form-input"
                    placeholder="Enter question..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Answer</label>
                  <textarea
                    defaultValue={faq.answer || ''}
                    onChange={() => {}} // No-op during typing - prevents rerendering
                    onBlur={(e) => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                      setFormData(prev => ({
                        ...prev,
                        faqs: newFaqs
                      }));
                    }}
                    className="form-input"
                    placeholder="Enter answer..."
                    rows="3"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  faqs: [...prev.faqs, { question: '', answer: '', display_order: prev.faqs.length }]
                }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1e293b',
                fontWeight: '500'
              }}
            >
              <FiPlus />
              Add FAQ
            </button>
          </div>
        </Modal>

        {/* Feature Cards Modal */}
        <Modal
          isOpen={activeModal === 'feature-cards'}
          onClose={() => setActiveModal(null)}
          title="Product Feature Cards"
          width="650px"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">Product Feature Cards (Maximum 4 Cards)</h3>
            <p style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>
              Add feature/benefit cards for this product. Each card displays text and an image icon.
            </p>
            
            {formData.feature_cards.map((card, index) => (
              <div key={index} style={{ marginBottom: '25px', padding: '15px', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: isDark ? '#f59e0b' : '#f59e0b' }}>
                    Feature Card {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        feature_cards: prev.feature_cards.filter((_, i) => i !== index)
                      }));
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '5px 10px'
                    }}
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Card Text *</label>
                  <input
                    type="text"
                    defaultValue={card.card_text || ''}
                    onChange={() => {}} // No-op during typing - prevents rerendering
                    onBlur={(e) => {
                      const newCards = [...formData.feature_cards];
                      newCards[index] = { ...newCards[index], card_text: e.target.value, display_order: index + 1 };
                      setFormData(prev => ({ ...prev, feature_cards: newCards }));
                    }}
                    className="form-input"
                    placeholder="e.g., Supports Hormonal Balance"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Card Image URL</label>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="url"
                        defaultValue={card.card_image_url || ''}
                        onChange={() => {}} // No-op during typing - prevents rerendering
                        onBlur={(e) => {
                          const newCards = [...formData.feature_cards];
                          newCards[index] = { ...newCards[index], card_image_url: e.target.value };
                          setFormData(prev => ({ ...prev, feature_cards: newCards }));
                        }}
                        className="form-input"
                        placeholder="https://example.com/icons/card-icon.png"
                      />
                      <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', marginTop: '5px' }}>
                        Enter the full URL of the card icon/image
                      </p>
                    </div>
                    {card.card_image_url && (
                      <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}` }}>
                        <img
                          src={card.card_image_url}
                          alt={card.card_text || 'Card'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {formData.feature_cards.length < 4 && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    feature_cards: [...prev.feature_cards, { card_text: '', card_image_url: '', display_order: prev.feature_cards.length + 1 }]
                  }));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: isDark ? '#21262d' : '#f1f5f9',
                  border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: isDark ? '#e6edf3' : '#1e293b',
                  fontWeight: '500'
                }}
              >
                <FiPlus />
                Add Feature Card
              </button>
            )}
            {formData.feature_cards.length >= 4 && (
              <p style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic' }}>
                Maximum 4 feature cards allowed
              </p>
            )}
          </div>
        </Modal>

        {/* All configuration is done through modals - removed duplicate sections */}

        {/* Product Attributes - Only for Variable Products */}
        {formData.product_type === 'variable' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Product Attributes</h3>
            
            {/* Available Colors */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500', color: isDark ? '#e6edf3' : '#1e293b' }}>Available Colors</h4>
              <div style={{ display: 'flex', gap: '20px' }}>
                {colors.map(color => (
                  <label key={color.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.colors.includes(color.id)}
                      onChange={() => handleColorChange(color.id)}
                    />
                    <span style={{ color: isDark ? '#e6edf3' : '#1e293b' }}>{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Available Sizes */}
            <div>
              <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500', color: isDark ? '#e6edf3' : '#1e293b' }}>Available Sizes</h4>
              <div style={{ display: 'flex', gap: '20px' }}>
                {sizes.map(size => (
                  <label key={size.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.sizes.includes(size.id)}
                      onChange={() => handleSizeChange(size.id)}
                    />
                    <span style={{ color: isDark ? '#e6edf3' : '#1e293b' }}>{size.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grouped Products Section - Only when is_grouped_product is checked */}
        {formData.is_grouped_product && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Grouped Products</h3>
            
            {/* Add Products to Group */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500', color: isDark ? '#e6edf3' : '#1e293b' }}>Add Products to Group</h4>
              <div style={{ 
                padding: '15px',
                background: isDark ? '#161b22' : '#f8fafc',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`
              }}>
                <div style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '15px' }}>
                  Select existing products to include in this group. Customers can buy individual items or the entire group.
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {existingProducts.map(product => (
                    <div key={product.id} style={{ 
                      padding: '10px',
                      background: isDark ? '#0d1117' : 'white',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '11px', color: isDark ? '#8b949e' : '#64748b' }}>
                          SKU: {product.sku} | ₹{product.base_price || product.price || 0}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddGroupedProduct(product.id)}
                        disabled={formData.grouped_products.find(p => p.id === product.id)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: formData.grouped_products.find(p => p.id === product.id) 
                            ? (isDark ? '#30363d' : '#e2e8f0')
                            : '#3b82f6',
                          color: formData.grouped_products.find(p => p.id === product.id) 
                            ? (isDark ? '#8b949e' : '#64748b')
                            : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: formData.grouped_products.find(p => p.id === product.id) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {formData.grouped_products.find(p => p.id === product.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Products in Group */}
            {formData.grouped_products.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '500', color: isDark ? '#e6edf3' : '#1e293b' }}>Products in Group ({formData.grouped_products.length})</h4>
                <div style={{ 
                  padding: '15px',
                  background: isDark ? 'rgba(88, 166, 255, 0.1)' : '#f0f9ff',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#58a6ff' : '#0ea5e9'}`
                }}>
                  {formData.grouped_products.map(product => (
                    <div key={product.id} style={{ 
                      padding: '10px',
                      background: isDark ? '#0d1117' : 'white',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px', color: isDark ? '#e6edf3' : '#1e293b' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>
                          SKU: {product.sku} | ₹{product.price}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <label style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Qty:</label>
                          <input
                            type="number"
                            defaultValue={product.quantity}
                            onChange={() => {}} // No-op during typing - prevents rerendering
                            onBlur={(e) => handleGroupedProductQuantityChange(product.id, e.target.value)}
                            className="form-input"
                            style={{
                              width: '60px',
                              padding: '4px',
                              fontSize: '12px'
                            }}
                            min="1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGroupedProduct(product.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Group Summary */}
                  <div style={{ 
                    marginTop: '15px',
                    padding: '10px',
                    background: isDark ? '#161b22' : '#1e293b',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Total Products: {formData.grouped_products.length} | 
                    Total Value: ₹{formData.grouped_products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All sections moved to modals - cleaner interface */}

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            <FiSave />
            {loading ? 'Creating...' : 'Submit Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

