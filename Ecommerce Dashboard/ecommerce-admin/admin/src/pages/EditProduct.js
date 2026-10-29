import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { 
  FiSave, 
  FiUpload, 
  FiX, 
  FiPlus,
  FiImage,
  FiPackage,
  FiChevronDown,
  FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelected } from '../store/currencySlice';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';
import { useFieldConfig } from '../hooks/useFieldConfig';
import { getApiEndpoint, getApiEndpointSync } from '../services/fieldConfigService';

// ---------- Shared Local-State Form Inputs (top-level so all components can use) ----------

// Local-state input component - NO parent re-renders during typing
const LocalStateInput = memo(React.forwardRef(({
  value: initialValue,
  onCommit,
  type = 'text',
  name,
  placeholder,
  className,
  style,
  maxLength,
  required,
  commitOnBlur = true,
  ...props
}, ref) => {
  // Handle number inputs differently - allow empty string, null, undefined, or number
  const getInitialValue = () => {
    if (type === 'number') {
      return initialValue === null || initialValue === undefined ? '' : String(initialValue);
    }
    return initialValue || '';
  };

  const [localValue, setLocalValue] = useState(getInitialValue());
  const inputRef = useRef(null);
  const isFocusedRef = useRef(false);
  const previousInitialValueRef = useRef(initialValue);
  const hasCommittedRef = useRef(false);

  // Sync with external value changes (but not during typing)
  useEffect(() => {
    // NEVER sync if the input is currently focused - user is typing/deleting
    if (isFocusedRef.current) {
      return;
    }

    // Normalize values for comparison
    const normalizeValue = (val) => {
      if (type === 'number') {
        if (val === null || val === undefined || val === '') return null;
        return Number(val);
      }
      return val;
    };

    const normalizedCurrent = normalizeValue(previousInitialValueRef.current);
    const normalizedNew = normalizeValue(initialValue);
    
    // Only update if the value actually changed
    const valueChanged = normalizedCurrent !== normalizedNew;
    
    if (valueChanged) {
      const newLocalValue = getInitialValue();
      setLocalValue(newLocalValue);
      previousInitialValueRef.current = initialValue;
      hasCommittedRef.current = false; // Reset commit flag when external value changes
    } else {
      // Update ref to track current state
      previousInitialValueRef.current = initialValue;
    }
  }, [initialValue, type]);

  const combinedRef = useCallback((node) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    // Always update local state immediately for responsive typing
    setLocalValue(newValue);
    // Only commit immediately if commitOnBlur is false (for instant updates)
    if (!commitOnBlur && onCommit) {
      // For number inputs, convert empty string to null, otherwise parse as number
      if (type === 'number') {
        const numValue = newValue === '' ? null : (newValue === '-' ? null : parseFloat(newValue));
        const finalValue = isNaN(numValue) ? null : numValue;
        onCommit(finalValue);
        // Update ref to prevent sync from overwriting
        previousInitialValueRef.current = finalValue;
        hasCommittedRef.current = true;
      } else {
        onCommit(newValue);
        previousInitialValueRef.current = newValue;
        hasCommittedRef.current = true;
      }
    }
  }, [onCommit, commitOnBlur, type]);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (commitOnBlur && onCommit) {
      // For number inputs, convert empty string to null, otherwise parse as number
      let committedValue;
      if (type === 'number') {
        const trimmedValue = localValue.trim();
        const numValue = trimmedValue === '' || trimmedValue === '-' ? null : parseFloat(trimmedValue);
        committedValue = isNaN(numValue) ? null : numValue;
      } else {
        committedValue = localValue;
      }
      onCommit(committedValue);
      // Update ref to the committed value to prevent sync from overwriting
      previousInitialValueRef.current = committedValue;
      hasCommittedRef.current = true;
    } else {
      // Even if not committing, update ref to current local value
      previousInitialValueRef.current = type === 'number' 
        ? (localValue === '' ? null : parseFloat(localValue))
        : localValue;
    }
  }, [localValue, onCommit, commitOnBlur, type]);

  // Ensure value is always a string (required for controlled inputs)
  const displayValue = localValue === null || localValue === undefined ? '' : String(localValue);

  return (
    <input
      ref={combinedRef}
      type={type}
      name={name}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      style={style}
      maxLength={maxLength}
      required={required}
      {...props}
    />
  );
}));

// Local-state textarea component
const LocalStateTextarea = memo(({
  value: initialValue,
  onCommit,
  name,
  placeholder,
  className,
  style,
  rows,
  commitOnBlur = true,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(initialValue || '');
  const textareaRef = useRef(null);
  const isFocusedRef = useRef(false);

  // Sync with external value changes (but not during typing)
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(initialValue || '');
    }
  }, [initialValue]);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (!commitOnBlur && onCommit) {
      onCommit(newValue);
    }
  }, [onCommit, commitOnBlur]);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (commitOnBlur && onCommit) {
      onCommit(localValue);
    }
  }, [localValue, onCommit, commitOnBlur]);

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      style={style}
      rows={rows}
      {...props}
    />
  );
});

// Product Color Modal Component - Uses local state, commits on save
const ProductColorModal = memo(({ 
  isOpen, 
  initialColorName, 
  initialColorShade, 
  onClose, 
  onSave,
  getColorNameFromHex,
  generateColorNameFromHex,
  getContrastColor
}) => {
  const [localColorName, setLocalColorName] = useState(initialColorName || '');
  const [localColorShade, setLocalColorShade] = useState(initialColorShade || '#000000');
  const [colorError, setColorError] = useState('');
  
  // Sync with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalColorName(initialColorName || '');
      setLocalColorShade(initialColorShade || '#000000');
      setColorError('');
    }
  }, [isOpen, initialColorName, initialColorShade]);
  
  const handleColorPickerChange = useCallback((e) => {
    const hexValue = e.target.value.toUpperCase();
    const colorName = getColorNameFromHex(hexValue);
    const generatedName = generateColorNameFromHex(hexValue);
    
    setLocalColorShade(hexValue);
    setLocalColorName(colorName || generatedName || localColorName);
    setColorError('');
  }, [getColorNameFromHex, generateColorNameFromHex, localColorName]);
  
  const handleHexInputChange = useCallback((value) => {
    let hexValue = value.toUpperCase();
    
    if (hexValue && !hexValue.startsWith('#')) {
      hexValue = '#' + hexValue;
    }
    
    if (hexValue === '' || hexValue === '#' || /^#[0-9A-F]{0,6}$/.test(hexValue)) {
      setLocalColorShade(hexValue);
      setColorError('');
      
      if (hexValue.length === 7 && /^#[0-9A-F]{6}$/.test(hexValue)) {
        setColorError('');
        const colorName = getColorNameFromHex(hexValue);
        const generatedName = generateColorNameFromHex(hexValue);
        setLocalColorName(colorName || generatedName || localColorName);
      } else if (hexValue.length > 1 && hexValue.length < 7) {
        setColorError('Hex code must be 6 characters (e.g., #FF0000)');
      }
    }
  }, [getColorNameFromHex, generateColorNameFromHex, localColorName]);
  
  const handleColorNameChange = useCallback((value) => {
    setLocalColorName(value);
  }, []);
  
  const handlePresetClick = useCallback((preset) => {
    setLocalColorName(preset.name);
    setLocalColorShade(preset.hex);
    setColorError('');
  }, []);
  
  const handleSave = useCallback(() => {
    onSave(localColorName.trim(), localColorShade.trim());
  }, [localColorName, localColorShade, onSave]);
  
  if (!isOpen) return null;
  
  const colorPresets = [
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
  ];
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Product Color</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#64748b',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <FiX />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">Product Color Configuration</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Set the product color name and hex code. The color will be stored in the database and displayed on the product page.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Color Name</label>
                <LocalStateInput
                  type="text"
                  value={localColorName}
                  onCommit={handleColorNameChange}
                  className="form-input"
                  placeholder="e.g., Red, Blue, Green, Multi-color, Navy Blue"
                  commitOnBlur={true}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                  Enter a descriptive name for the color
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Color Shade (Hex Code)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="color"
                      value={localColorShade}
                      onChange={handleColorPickerChange}
                      style={{ 
                        width: '70px', 
                        height: '50px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Click to pick a color"
                    />
                  </div>
                  <LocalStateInput
                    type="text"
                    value={localColorShade}
                    onCommit={handleHexInputChange}
                    className="form-input"
                    placeholder="#000000"
                    style={{ 
                      flex: 1,
                      minWidth: '120px',
                      borderColor: colorError ? '#ef4444' : '#e2e8f0'
                    }}
                    maxLength={7}
                    commitOnBlur={true}
                  />
                  <div 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: localColorShade, 
                      border: '2px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getContrastColor(localColorShade),
                      fontSize: '10px',
                      fontWeight: '600',
                      textAlign: 'center',
                      padding: '2px'
                    }}
                    title={`Preview: ${localColorShade}`}
                  >
                    {localColorShade}
                  </div>
                </div>
                {colorError && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px' }}>
                    {colorError}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                  Click the color box to pick any color, or type hex code (e.g., #FF0000 for red, #0000FF for blue)
                </p>
              </div>
            </div>

            {/* Color Preview Section */}
            {(localColorName || localColorShade) && (
              <div style={{ 
                padding: '20px', 
                background: '#f0f9ff', 
                borderRadius: '8px',
                border: '2px solid #0ea5e9',
                marginTop: '20px'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '15px', color: '#1e293b' }}>
                  Color Preview
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      backgroundColor: localColorShade, 
                      border: '3px solid #e2e8f0', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getContrastColor(localColorShade),
                      fontSize: '11px',
                      fontWeight: '700',
                      textAlign: 'center',
                      padding: '5px'
                    }}
                  >
                    {localColorShade}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>
                      {localColorName || 'Unnamed Color'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Hex: {localColorShade}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Color Presets */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                Quick Color Presets
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {colorPresets.map(preset => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    style={{
                      padding: '10px',
                      background: '#f8fafc',
                      border: `2px solid ${localColorShade === preset.hex ? '#3b82f6' : '#e2e8f0'}`,
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
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#1e293b', fontWeight: '500' }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#fff',
                  fontWeight: '500'
                }}
              >
                Save Color
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const selectedCurrency = useSelector((s) => s.currency?.selected || 'INR');
  const keyIngredientsConfig = useFieldConfig('key_ingredients');
  const healthBenefitsConfig = useFieldConfig('health_benefits');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [convertedPrices, setConvertedPrices] = useState({
    regular_price: '',
    sale_price: '',
    currency_symbol: '₹',
    currency_code: 'INR'
  });
  const [formData, setFormData] = useState({
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
    is_grouped_product: false,
    grouped_products: [],
    regional_prices: [],
    regional_tax_rates: {},
    tax_rate: null,  // Product-specific tax rate
    is_taxable: true,  // Whether product is taxable
    color_name: '',
    color_shade: '#000000',
    key_ingredients: [],
    feature_cards: [],
    faqs: []
  });
  const [categories, setCategories] = useState([]);
  const [healthBenefits, setHealthBenefits] = useState([]);
  const [healthBenefitsLoading, setHealthBenefitsLoading] = useState(true);
  const healthBenefitsFetchAttempted = useRef(false);
  const healthBenefitsFetchFailed = useRef(false);
  const healthBenefitsAbortController = useRef(null);
  const [keyIngredients, setKeyIngredients] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [colorError, setColorError] = useState('');
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [initialCategoryId, setInitialCategoryId] = useState(null);
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
  
  // Function to fetch health benefits - can be called on initial load or when modal opens
  const fetchHealthBenefits = useCallback(async (showErrorToast = false) => {
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
      let healthBenefitsEndpoint = '/health-benefits';
      try {
        healthBenefitsEndpoint = getApiEndpointSync('health_benefits');
      } catch (e) {
        console.warn('Could not get dynamic endpoint, using default:', e);
        healthBenefitsEndpoint = '/health-benefits';
      }
      console.log('Fetching health benefits from:', healthBenefitsEndpoint);
      
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
      
      const healthBenefitsRes = await apiClient.get(healthBenefitsEndpoint, {
        suppressErrorToast: !showErrorToast,
        signal: abortController.signal  // Add abort signal to cancel request if needed
      });
      
      console.log('Health benefits API response status:', healthBenefitsRes.status);
      console.log('Health benefits API response data:', healthBenefitsRes.data);
      
      const benefits = healthBenefitsRes.data?.health_benefits || healthBenefitsRes.data || [];
      const benefitsArray = Array.isArray(benefits) ? benefits : [];
      console.log('Parsed health benefits array:', benefitsArray);
      console.log('Setting health benefits:', benefitsArray.length, 'items');
      
      if (benefitsArray.length > 0) {
        console.log('First health benefit example:', benefitsArray[0]);
      }
      
      setHealthBenefits(benefitsArray);
      setHealthBenefitsLoading(false);
      healthBenefitsFetchFailed.current = false;
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
      
      if (error.response?.status === 401) {
        healthBenefitsFetchFailed.current = true;
        console.warn('Health benefits fetch failed with 401 - authentication required');
        if (showErrorToast) {
          toast.error('Authentication required. Please login again.');
        }
      } else if (showErrorToast) {
        toast.error('Failed to load health benefits. Please try again.');
      }
      
      setHealthBenefits([]);
      setHealthBenefitsLoading(false);
      healthBenefitsAbortController.current = null; // Clear abort controller on error
      return [];
    }
  }, []);
  
  // Fetch health benefits when modal opens if they're not loaded
  useEffect(() => {
    if (
      activeModal === 'health-benefits' && 
      healthBenefits.length === 0 && 
      !healthBenefitsLoading &&
      !healthBenefitsFetchAttempted.current
    ) {
      console.log('Health benefits modal opened, fetching health benefits...');
      healthBenefitsFetchAttempted.current = true;
      fetchHealthBenefits(true);
    }
    
    if (activeModal !== 'health-benefits') {
      healthBenefitsFetchAttempted.current = false;
      healthBenefitsFetchFailed.current = false;
    }
  }, [activeModal, fetchHealthBenefits]);
  
  // Cleanup: Cancel any pending health benefits request on unmount
  useEffect(() => {
    return () => {
      if (healthBenefitsAbortController.current) {
        healthBenefitsAbortController.current.abort();
        healthBenefitsAbortController.current = null;
      }
    };
  }, []);
  
  // Modal component
  const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '12px'
      }} onClick={onClose}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#fff',
            zIndex: 10
          }}>
            <h3 style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
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
  
  // Section button component
  const SectionButton = ({ icon, title, description, onClick, count = null, completed = false }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '20px',
        background: completed ? '#f0fdf4' : '#fff',
        border: completed ? '2px solid #10b981' : '2px solid #e2e8f0',
        borderRadius: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        background: '#f0f9ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        color: '#3b82f6',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{title}</h4>
          {count !== null && (
            <span style={{
              background: '#3b82f6',
              color: '#fff',
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {count}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{description}</p>
      </div>
      <div style={{ color: '#64748b', fontSize: '20px' }}>
        →
      </div>
    </button>
  );

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

  // Helper function to get color name from hex code - memoized
  const getColorNameFromHex = useCallback((hexCode) => {
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
      '#696969': 'Dim Gray',
      '#3A3636': 'Dark Gray',
      '#2F2F2F': 'Dark Gray',
      '#1C1C1C': 'Almost Black',
      '#F5F5DC': 'Beige',
      '#800000': 'Maroon',
      '#008080': 'Teal',
      '#00FFFF': 'Cyan',
      '#FF00FF': 'Magenta',
      '#FFD700': 'Gold',
      '#C0C0C0': 'Silver',
      '#6B6B76': 'Slate Gray',
    };
    
    return colorMap[hex] || null;
  }, []);
  
  // Helper to generate a descriptive color name from hex
  const generateColorNameFromHex = useCallback((hex) => {
    if (!hex || !hex.startsWith('#')) return null;
    
    const hexClean = hex.replace('#', '');
    const r = parseInt(hexClean.substring(0, 2), 16);
    const g = parseInt(hexClean.substring(2, 4), 16);
    const b = parseInt(hexClean.substring(4, 6), 16);
    
    // Generate a descriptive name based on RGB values
    if (r === g && g === b) {
      if (r < 85) return 'Dark Gray';
      if (r < 170) return 'Gray';
      return 'Light Gray';
    }
    
    // Check for common color patterns
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 150 && b < 100) return 'Orange';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 150 && b > 200) return 'Cyan';
    
    // Default to a generic name
    return `Custom Color (${hex})`;
  }, []);
  
  // Color picker handler - properly synced
  const handleColorPickerChange = useCallback((e) => {
    const hexValue = e.target.value.toUpperCase();
    const colorName = getColorNameFromHex(hexValue);
    
    // ALWAYS update color_shade, and update color_name
    // If color is recognized, use the name; otherwise generate a descriptive name
    setFormData(prev => ({ 
      ...prev, 
      color_shade: hexValue,
      color_name: colorName || generateColorNameFromHex(hexValue) || prev.color_name
    }));
    setColorError('');
  }, [getColorNameFromHex, generateColorNameFromHex]);
  
  // Hex input handler - properly synced
  const handleHexInputChange = useCallback((e) => {
    const cursorPosition = e.target.selectionStart;
    let value = e.target.value.toUpperCase();
    
    // Add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Allow typing # and hex characters
    if (value === '' || value === '#' || /^#[0-9A-F]{0,6}$/.test(value)) {
      setFormData(prev => ({ ...prev, color_shade: value }));
      setColorError('');
      
      // Validate complete hex code and update color name
      if (value.length === 7 && /^#[0-9A-F]{6}$/.test(value)) {
        setColorError('');
        const colorName = getColorNameFromHex(value);
        const generatedName = generateColorNameFromHex(value);
        setFormData(prev => ({ 
          ...prev, 
          color_name: colorName || generatedName || prev.color_name
        }));
      } else if (value.length > 1 && value.length < 7) {
        setColorError('Hex code must be 6 characters (e.g., #FF0000)');
      }
      
      // Restore cursor position
      requestAnimationFrame(() => {
        if (e.target && document.activeElement === e.target) {
          const newPosition = Math.min(cursorPosition, e.target.value.length);
          e.target.setSelectionRange(newPosition, newPosition);
        }
      });
    }
  }, [getColorNameFromHex, generateColorNameFromHex]);
  
  // Color preset handler
  const handleColorPresetClick = useCallback((preset) => {
    setFormData(prev => ({ 
      ...prev, 
      color_name: preset.name,
      color_shade: preset.hex
    }));
    setColorError('');
  }, []);

  useEffect(() => {
    fetchData();
    fetchProduct();
  }, [id]);

useEffect(() => {
  if (categories.length === 0 || !initialCategoryId) return;
  const category = categories.find(cat => cat.id === initialCategoryId);
  if (category) {
    if (category.parent_id) {
      setSelectedMainCategoryId(String(category.parent_id));
      setSelectedSubCategoryId(String(category.id));
    } else {
      setSelectedMainCategoryId(String(category.id));
      setSelectedSubCategoryId('');
    }
  }
}, [categories, initialCategoryId]);

  // Fetch converted prices when currency/country changes
  useEffect(() => {
    if (formData.regular_price && id) {
      fetchConvertedPrices();
    }
  }, [selectedCurrency, selectedCountry, formData.regular_price, formData.sale_price]);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AED': 'د.إ',
      'CAD': 'CA$'
    };
    return symbols[currencyCode] || currencyCode;
  };

  // Fetch converted prices from backend
  const fetchConvertedPrices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }
      if (!token || !formData.regular_price) return;

      const response = await apiClient.get(`/products/${id}/convert`, {
          params: {
            currency: selectedCurrency,
            country_code: selectedCountry
        }
      });

      if (response.data.product) {
        const product = response.data.product;
        setConvertedPrices({
          regular_price: product.converted_price || product.base_price,
          sale_price: product.converted_sale_price || product.sale_price,
          currency_symbol: getCurrencySymbol(selectedCurrency),
          currency_code: selectedCurrency
        });
      }
    } catch (error) {
      console.error('Error fetching converted prices:', error);
      // Fallback to base prices
      setConvertedPrices({
        regular_price: formData.regular_price,
        sale_price: formData.sale_price,
        currency_symbol: getCurrencySymbol(selectedCurrency),
        currency_code: selectedCurrency
      });
    }
  };

  // Handle country change
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    
    // Auto-select the country's currency
    const country = countries.find(c => c.country_code === countryCode);
    if (country && country.currency_code) {
      dispatch(setSelected(country.currency_code));
    }
  };

  // Handle currency change
  const handleCurrencyChange = (currencyCode) => {
    dispatch(setSelected(currencyCode));
    
    // Auto-select a country that uses this currency
    const country = countries.find(c => c.currency_code === currencyCode);
    if (country) {
      setSelectedCountry(country.country_code);
    }
  };

  // Helper function to get standard tax rates for a country
  const getCountryTaxRates = (countryCode) => {
    const taxRatesByCountry = {
      'IN': [0, 5, 12, 18, 28], // India GST rates
      'AE': [0, 5], // UAE VAT rates
      'US': [0, 5, 7.5, 10], // US sales tax rates
      'DE': [0, 7, 19], // Germany VAT rates
      'ES': [0, 4, 10, 21], // Spain VAT rates
      'GB': [0, 5, 20], // UK VAT rates
      'CA': [0, 5, 13, 15], // Canada GST/HST rates
    };
    
    return taxRatesByCountry[countryCode] || [0, 5, 10, 15, 18]; // Default rates
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch real categories
      try {
        const categoriesRes = await apiClient.get('/products/categories', {
          params: { include_inactive: false }
        });
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
      
      // Sizes and colors tables don't exist yet - set empty
      setSizes([]);
      setColors([]);

      // Fetch existing products for grouping
      if (token) {
        try {
          const response = await apiClient.get('/products/');
          setExistingProducts(response.data.products || []);
        } catch (error) {
          console.error('Error fetching products:', error);
        }

        // Fetch countries and currencies for regional pricing
        // Only fetch ACTIVE countries (not inactive) to avoid duplicates
        try {
          const { fetchCountriesAndCurrencies: fetchUtil } = await import('../utils/countryCurrencyUtils');
          const { countries, currencies } = await fetchUtil(false); // Only active countries
          setCountries(countries);
          setCurrencies(currencies);
          console.log(`[EditProduct] Loaded ${countries.length} unique countries and ${currencies.length} currencies`);
        } catch (error) {
          console.error('Error fetching countries/currencies:', error);
        }
        
        // Fetch key ingredients
        try {
          const keyIngredientsRes = await apiClient.get('/key-ingredients', {
            params: { is_active: true }
          });
          setKeyIngredients(keyIngredientsRes.data.key_ingredients || []);
          console.log('Fetched key ingredients:', keyIngredientsRes.data.key_ingredients);
        } catch (error) {
          console.error('Error fetching key ingredients:', error);
          setKeyIngredients([]);
        }
        
        // Fetch health benefits
        await fetchHealthBenefits(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await apiClient.get(`/products/${id}`);

      const product = response.data.product;
      setInitialCategoryId(product.category_id || null);
      
      // Fetch regional tax overrides for this product
      let regionalTaxRates = {};
      try {
        const overridesRes = await apiClient.get('/product-regional-overrides/', {
          params: { product_id: id }
        });
        
        // Convert overrides array to {countryCode: taxRate} format
        (overridesRes.data.regional_overrides || []).forEach(override => {
          if (override.tax_rate_override !== null && override.tax_rate_override !== undefined) {
            regionalTaxRates[override.country_code] = override.tax_rate_override;
          }
        });
        
        console.log('✅ Loaded regional tax overrides:', regionalTaxRates);
      } catch (error) {
        console.error('Error fetching regional overrides:', error);
        // Continue even if overrides fail - not critical
      }
      
      // Extract health benefit IDs from product
      const healthBenefitIds = product.health_benefits 
        ? product.health_benefits.map(hb => hb.id).filter(id => id !== undefined && id !== null)
        : [];
      
      console.log('Loaded health benefits from product:', healthBenefitIds);
      
      setFormData({
        product_type: 'simple',
        name: product.name || '',
        description: product.description || '',
        health_benefits: healthBenefitIds,
        featured: product.featured !== undefined ? product.featured : false,
        sizes: [],
        colors: [],
        regular_price: product.base_price || '',
        sale_price: product.sale_price || '',
        sku: product.sku || '',
        gtin: '',
        track_stock: true,
        stock_status: 'in_stock',
        is_grouped_product: product.is_grouped_product || false,
        grouped_products: [],
        regional_prices: [],
        regional_tax_rates: regionalTaxRates, // Use fetched overrides
        tax_rate: product.tax_rate || null,  // Product-specific tax rate
        is_taxable: product.is_taxable !== undefined ? product.is_taxable : true,
        color_name: product.color_name || '',
        color_shade: product.color_shade || '#000000',  // Product taxable flag
        key_ingredients: product.key_ingredients ? product.key_ingredients.map(ki => ({
          name: ki.name || '',
          description: ki.description || '',
          image_url: ki.image_url || ''
        })) : [],
        feature_cards: product.feature_cards ? product.feature_cards.map(card => ({
          card_text: card.card_text || '',
          card_image_url: card.card_image_url || '',
          display_order: card.display_order || 0,
          is_active: card.is_active !== undefined ? card.is_active : true
        })) : [],
        faqs: product.faqs && Array.isArray(product.faqs) ? product.faqs.map(faq => ({
          id: faq.id,
          question: faq.question || '',
          answer: faq.answer || '',
          display_order: faq.display_order || 0
        })) : []
      });

      if (product.image_url) {
        setFeaturedImage(product.image_url);
      }

      // Load product images
      setProductImages({
        image1: product.image1 || '',
        image2: product.image2 || '',
        image3: product.image3 || '',
        image4: product.image4 || '',
        image5: product.image5 || ''
      });

    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
  };

  // Refs for inputs to prevent focus loss
  const colorNameInputRef = useRef(null);
  const ingredientInputRefs = useRef({});

  // Stable handleChange for checkboxes and selects (instant updates)
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 handleSubmit called - Starting product update...');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token check:', token ? 'Token exists' : 'No token found');
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        console.log('❌ Validation failed: Product name is required');
        toast.error('Product name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.regular_price || parseFloat(formData.regular_price) <= 0) {
        console.log('❌ Validation failed: Valid regular price is required');
        toast.error('Valid regular price is required');
        setLoading(false);
        return;
      }
      
      console.log('✅ Validation passed, proceeding with update...');
      
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

      // Log current productImages state before building productData
      console.log('📸 Current productImages state:', productImages);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: finalCategoryId,
        base_price: parseFloat(formData.regular_price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        sku: formData.sku.trim(),
        stock_quantity: 100, // Default stock
        min_order_quantity: 1,
        max_order_quantity: null,
        is_active: true,
        featured: formData.featured,  // Featured product flag
        reward_points: 0,
        is_grouped_product: formData.is_grouped_product,
        regional_tax_rates: formData.regional_tax_rates,
        tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : null,  // Product-specific tax
        is_taxable: formData.is_taxable,  // Product taxable flag
        color_name: (formData.color_name && formData.color_name.trim()) ? formData.color_name.trim() : null,
        color_shade: (formData.color_shade && formData.color_shade.trim()) ? formData.color_shade.trim() : null,
        health_benefit_ids: formData.health_benefits || [],
        key_ingredients: (formData.key_ingredients || []).map(ingredient => ({
          name: ingredient.name,
          description: ingredient.description || '',
          image_url: ingredient.image_url || ''
        })),
        feature_cards: (formData.feature_cards || []).map((card, index) => ({
          card_text: card.card_text,
          card_image_url: card.card_image_url || '',
          display_order: index + 1,
          is_active: true
        })),
        faqs: (formData.faqs || []).map((faq, index) => ({
          question: faq.question || '',
          answer: faq.answer || '',
          display_order: faq.display_order || index
        })),
        image1: productImages.image1 && productImages.image1.trim() ? productImages.image1.trim() : null,
        image2: productImages.image2 && productImages.image2.trim() ? productImages.image2.trim() : null,
        image3: productImages.image3 && productImages.image3.trim() ? productImages.image3.trim() : null,
        image4: productImages.image4 && productImages.image4.trim() ? productImages.image4.trim() : null,
        image5: productImages.image5 && productImages.image5.trim() ? productImages.image5.trim() : null
      };

      console.log('📤 Preparing to send product update...');
      console.log('📸 Image data in productData:', {
        image1: productData.image1 ? `${productData.image1.substring(0, 50)}... (${productData.image1.length} chars)` : 'null',
        image2: productData.image2 ? `${productData.image2.substring(0, 50)}... (${productData.image2.length} chars)` : 'null',
        image3: productData.image3 ? `${productData.image3.substring(0, 50)}... (${productData.image3.length} chars)` : 'null',
        image4: productData.image4 ? `${productData.image4.substring(0, 50)}... (${productData.image4.length} chars)` : 'null',
        image5: productData.image5 ? `${productData.image5.substring(0, 50)}... (${productData.image5.length} chars)` : 'null'
      });
      console.log('📦 Full productData payload (first 500 chars of each image):', JSON.stringify({
        ...productData,
        image1: productData.image1 ? productData.image1.substring(0, 100) + '...' : null,
        image2: productData.image2 ? productData.image2.substring(0, 100) + '...' : null,
        image3: productData.image3 ? productData.image3.substring(0, 100) + '...' : null,
        image4: productData.image4 ? productData.image4.substring(0, 100) + '...' : null,
        image5: productData.image5 ? productData.image5.substring(0, 100) + '...' : null
      }, null, 2));

      console.log(`🚀 Making PUT request to /products/${id}...`);
      const response = await apiClient.put(`/products/${id}`, productData);
      console.log('✅ PUT request completed successfully:', response.status);

      toast.success('Product updated successfully!');
      navigate('/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => navigate('/products')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#64748b'
            }}
          >
            <FiArrowLeft /> Back to Products
          </button>
          <h2 className="card-title" style={{ color: '#f59e0b', margin: 0 }}>Edit Product</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-title">Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <LocalStateInput
                type="text"
                value={formData.name}
                onCommit={(value) => setFormData(prev => ({ ...prev, name: value }))}
                className="form-input"
                placeholder="Enter product name"
                required
                commitOnBlur={true}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">SKU</label>
              <LocalStateInput
                type="text"
                value={formData.sku}
                onCommit={(value) => setFormData(prev => ({ ...prev, sku: value }))}
                className="form-input"
                placeholder="Enter SKU"
                commitOnBlur={true}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <LocalStateTextarea
              value={formData.description}
              onCommit={(value) => setFormData(prev => ({ ...prev, description: value }))}
              className="form-input"
              placeholder="Enter product description"
              rows="4"
              commitOnBlur={true}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px',
              background: formData.is_grouped_product ? '#f0f9ff' : '#f8fafc',
              border: formData.is_grouped_product ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                name="is_grouped_product"
                checked={formData.is_grouped_product}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>📦 Grouped Product</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Show details page only</div>
              </div>
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '12px',
              background: formData.featured ? '#fef3c7' : '#f8fafc',
              border: formData.featured ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: formData.featured ? '#92400e' : '#1e293b' }}>
                  ⭐ Featured Product
                </div>
                <div style={{ fontSize: '11px', color: formData.featured ? '#92400e' : '#64748b', marginTop: '2px' }}>
                  Show on homepage & featured sections
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Quick Access Sections */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Product Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            <SectionButton
              icon={<FiPackage />}
              title="Categories"
              description="Select product category and subcategory"
              onClick={() => setActiveModal('categories')}
            />
            <SectionButton
              icon="💰"
              title="Pricing & Currency"
              description="Set base price, sale price, and currency conversion"
              onClick={() => setActiveModal('pricing')}
            />
            <SectionButton
              icon="📊"
              title="Tax Settings"
              description="Configure product tax rates and regional overrides"
              onClick={() => setActiveModal('tax')}
            />
            <SectionButton
              icon="🌍"
              title="Regional Tax Rates"
              description="Set country-specific tax rate overrides"
              onClick={() => setActiveModal('regional-tax')}
            />
            <SectionButton
              icon="🧪"
              title={keyIngredientsConfig.displayLabel || 'Key Ingredients'}
              description={`Manage product ${(keyIngredientsConfig.displayLabel || 'ingredients').toLowerCase()} (${formData.key_ingredients.length} added)`}
              count={formData.key_ingredients.length}
              onClick={() => setActiveModal('key-ingredients')}
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
            />
            <SectionButton
              icon="🎨"
              title="Product Color"
              description={formData.color_name || formData.color_shade ? `Color: ${formData.color_name || 'Custom'} (${formData.color_shade || 'N/A'})` : 'Set product color name and hex code'}
              onClick={() => setActiveModal('product-color')}
            />
            <SectionButton
              icon={<FiImage />}
              title="Product Images"
              description="Add up to 5 product image URLs"
              onClick={() => setActiveModal('images')}
            />
            <SectionButton
              icon="❓"
              title="FAQs"
              description="Add frequently asked questions"
              onClick={() => setActiveModal('faqs')}
            />
          </div>
        </div>

        {/* Categories Modal */}
        <Modal
          isOpen={activeModal === 'categories'}
          onClose={() => setActiveModal(null)}
          title="Product Categories"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title" style={{ marginBottom: '15px' }}>Categories</h3>

          {categories.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Loading categories...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
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

          <p style={{ marginTop: '15px', fontSize: '13px', color: '#64748b' }}>
            Choose the main category for this product. If the category has nested options,
            you can pick a more specific subcategory such as Essential or Specialized Supplements.
          </p>
          </div>
        </Modal>

        {/* Pricing & Currency Modal */}
        <Modal
          isOpen={activeModal === 'pricing'}
          onClose={() => setActiveModal(null)}
          title="Pricing & Currency"
          width="900px"
        >
          <div style={{ marginBottom: '20px' }}>
          
          {/* Country & Currency Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <div className="form-group">
              <label className="form-label">View Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="form-input"
              >
                {countries.map(country => (
                  <option key={country.country_code} value={country.country_code}>
                    {country.country_name} ({country.country_code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">View Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="form-input"
              >
                {currencies.map(currency => (
                  <option key={currency.currency_code} value={currency.currency_code}>
                    {currency.currency_code} - {currency.currency_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Base Prices (INR) - Editable */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '15px' }}>
              Base Prices (INR) - Edit Here
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Base Price (₹) *</label>
                <LocalStateInput
                  type="number"
                  value={formData.regular_price}
                  onCommit={(value) => setFormData(prev => ({ ...prev, regular_price: value }))}
                  className="form-input"
                  placeholder="Enter base price in INR"
                  step="0.01"
                  min="0"
                  required
                  commitOnBlur={true}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Sale Price (₹)</label>
                <LocalStateInput
                  type="number"
                  value={formData.sale_price}
                  onCommit={(value) => setFormData(prev => ({ ...prev, sale_price: value }))}
                  className="form-input"
                  placeholder="Enter sale price in INR"
                  step="0.01"
                  min="0"
                  commitOnBlur={true}
                />
              </div>
            </div>
          </div>

          {/* Converted Prices - Display Only */}
          <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '2px solid #10b981' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#059669', marginBottom: '15px' }}>
              {convertedPrices.currency_symbol} Converted Price Preview ({convertedPrices.currency_code})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>
                  Regular Price
                </label>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  {convertedPrices.currency_symbol} {convertedPrices.regular_price ? parseFloat(convertedPrices.regular_price).toFixed(2) : '0.00'}
                </div>
              </div>
              
              {convertedPrices.sale_price && (
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>
                    Sale Price
                  </label>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                    {convertedPrices.currency_symbol} {parseFloat(convertedPrices.sale_price).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
              💡 These prices are automatically converted based on current exchange rates and regional settings.
            </div>
          </div>
          </div>
        </Modal>

        {/* Tax Settings Modal */}
        <Modal
          isOpen={activeModal === 'tax'}
          onClose={() => setActiveModal(null)}
          title="Product Tax Settings"
          width="800px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '10px' }}>Product Tax Settings</h3>
          <p className="form-label" style={{ fontSize: '14px', marginBottom: '20px', marginTop: '0', color: '#64748b' }}>
            Configure default tax settings for this product. These apply globally unless overridden by regional tax rates below.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            {/* Is Taxable Checkbox */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_taxable"
                  checked={formData.is_taxable}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_taxable: e.target.checked }))}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Product is Taxable</span>
              </label>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', marginLeft: '26px' }}>
                Uncheck if this product is tax-exempt
              </p>
            </div>

            {/* Product Tax Rate */}
            {formData.is_taxable && (
              <div className="form-group">
                <label className="form-label">Default Tax Rate (%)</label>
                <LocalStateInput
                  type="number"
                  name="tax_rate"
                  value={formData.tax_rate || ''}
                  onCommit={(value) => setFormData(prev => ({ ...prev, tax_rate: value }))}
                  className="form-input"
                  placeholder="e.g., 18 for 18% tax"
                  min="0"
                  max="100"
                  step="0.01"
                  style={{ maxWidth: '200px' }}
                  commitOnBlur={true}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                  This tax rate applies globally. Use regional tax rates below to override for specific countries.
                </p>
              </div>
            )}
          </div>
          
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            background: '#eff6ff', 
            borderRadius: '6px',
            border: '1px solid #bfdbfe',
            fontSize: '13px',
            color: '#1e40af'
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
          width="900px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '10px' }}>Regional Tax Rate Overrides</h3>
          <p className="form-label" style={{ fontSize: '14px', marginBottom: '20px', marginTop: '0' }}>
            Override the product tax rate for specific countries. Leave blank to use the product's default tax rate above.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {countries.map(country => (
              <div key={country.country_code} style={{ 
                padding: '15px', 
                border: '1px solid var(--border-color, #e2e8f0)', 
                borderRadius: '8px',
                background: 'var(--card-bg, #f8fafc)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary, #1e293b)' }}>{country.country_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>{country.country_code}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748b)', fontWeight: '500' }}>
                    Default: {country.default_tax_rate || 0}%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    style={{
                      width: '120px',
                      padding: '8px',
                      border: '1px solid var(--input-border, #d1d5db)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'var(--input-bg, #fff)',
                      color: 'var(--text-primary, #1e293b)'
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        regional_tax_rates: {
                          ...prev.regional_tax_rates,
                          [country.country_code]: value ? parseFloat(value) : null
                        }
                      }));
                    }}
                    value={formData.regional_tax_rates?.[country.country_code] ? String(formData.regional_tax_rates[country.country_code]) : ''}
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
            background: 'var(--tip-bg, #f0f9ff)', 
            borderRadius: '6px',
            border: '1px solid var(--tip-border, #0ea5e9)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--tip-text, #0369a1)', fontWeight: '500' }}>
              💡 Tip: Set specific tax rates for each region where you sell products. 
              This allows you to comply with local tax regulations and pricing strategies.
            </div>
          </div>
          </div>
        </Modal>

        {/* Key Ingredients Modal */}
        <Modal
          isOpen={activeModal === 'key-ingredients'}
          onClose={() => setActiveModal(null)}
          title={keyIngredientsConfig.displayLabel || 'Key Ingredients'}
          width="900px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title">{keyIngredientsConfig.displayLabel || 'Key Ingredients'}</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            {keyIngredientsConfig.config?.labels?.section_description || keyIngredientsConfig.labels?.section_description || 'Add key ingredients for this product. Each ingredient can have a name, description, and image.'}
          </p>
          
          {formData.key_ingredients.map((ingredient, index) => (
            <div key={index} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
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
                    fontSize: '18px',
                    padding: '5px 10px'
                  }}
                >
                  <FiX />
                </button>
              </div>
              
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">
                  {(keyIngredientsConfig.config?.labels?.name?.label_value || keyIngredientsConfig.labels?.name?.label_value || 'Ingredient Name')} *
                </label>
                <LocalStateInput
                  type="text"
                  value={ingredient.name || ''}
                  onCommit={(value) => {
                    const newIngredients = [...formData.key_ingredients];
                    newIngredients[index] = { ...newIngredients[index], name: value };
                    setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                  }}
                  className="form-input"
                  placeholder={keyIngredientsConfig.labels?.name?.placeholder_text || keyIngredientsConfig.config?.labels?.name?.placeholder_text || 'Enter ingredient name...'}
                  required
                  commitOnBlur={true}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">
                  {keyIngredientsConfig.labels?.description?.label_value || keyIngredientsConfig.config?.labels?.description?.label_value || 'Description'}
                </label>
                <LocalStateTextarea
                  value={ingredient.description || ''}
                  onCommit={(value) => {
                    const newIngredients = [...formData.key_ingredients];
                    newIngredients[index] = { ...newIngredients[index], description: value };
                    setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                  }}
                  className="form-input"
                  placeholder={keyIngredientsConfig.labels?.description?.placeholder_text || keyIngredientsConfig.config?.labels?.description?.placeholder_text || 'Enter ingredient description...'}
                  rows="3"
                  commitOnBlur={true}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {keyIngredientsConfig.labels?.image?.label_value || keyIngredientsConfig.config?.labels?.image?.label_value || 'Ingredient Image URL'}
                </label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <LocalStateInput
                      type="url"
                      value={ingredient.image_url || ''}
                      onCommit={(value) => {
                        const newIngredients = [...formData.key_ingredients];
                        newIngredients[index] = { ...newIngredients[index], image_url: value };
                        setFormData(prev => ({ ...prev, key_ingredients: newIngredients }));
                      }}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                      commitOnBlur={true}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                      Enter the full URL of the ingredient image
                    </p>
                  </div>
                  {ingredient.image_url && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
            {keyIngredientsConfig.config?.labels?.add_button || keyIngredientsConfig.labels?.add_button || 'Add Key Ingredient'}
          </button>
          </div>
        </Modal>

        {/* Health Benefits Modal */}
        <Modal
          isOpen={activeModal === 'health-benefits'}
          onClose={() => setActiveModal(null)}
          title={`Select ${healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'Health Benefits'}`}
          width="800px"
        >
          <div className="card" style={{ marginBottom: '20px', boxShadow: 'none', border: 'none', padding: 0 }}>
            <h3 className="card-title">
              {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'Health Benefits'}
            </h3>
            <p style={{ fontSize: '14px', color: isDark ? '#8b949e' : '#64748b', marginBottom: '20px' }}>
              {healthBenefitsConfig.config?.labels?.section_description || healthBenefitsConfig.labels?.section_description || 'Select health benefits for this product. At least one selection is required.'}
            </p>
            
            {healthBenefitsLoading ? (
              <p style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic' }}>
                Loading {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefits'}...
              </p>
            ) : healthBenefits.length === 0 ? (
              <div>
                <p style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic', marginBottom: '15px' }}>
                  No {healthBenefitsConfig.displayLabel || healthBenefitsConfig.config?.display_label || 'health benefits'} available. Please add some first or try refreshing.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    healthBenefitsFetchFailed.current = false;
                    healthBenefitsFetchAttempted.current = false;
                    fetchHealthBenefits(true);
                      }}
                      style={{ 
                    padding: '10px 20px',
                    background: isDark ? '#21262d' : '#f1f5f9',
                    border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                    borderRadius: '6px',
                        cursor: 'pointer',
                    fontSize: '14px',
                    color: isDark ? '#e6edf3' : '#1e293b',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🔄 Retry Loading
                </button>
                  </div>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {healthBenefits.map((benefit) => (
                    <label
                      key={benefit.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '15px',
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
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          accentColor: '#10b981'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                      fontWeight: '600',
                          fontSize: '14px',
                          color: isDark ? '#e6edf3' : '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {benefit.name}
                  </div>
                        {benefit.description && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: isDark ? '#8b949e' : '#64748b',
                            lineHeight: '1.4'
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

        {/* Product Color Modal - Local State Component */}
        {activeModal === 'product-color' && (
          <ProductColorModal
            isOpen={true}
            initialColorName={formData.color_name || ''}
            initialColorShade={formData.color_shade || '#000000'}
            onClose={() => setActiveModal(null)}
            onSave={(colorName, colorShade) => {
                      setFormData(prev => ({ 
                        ...prev, 
                color_name: colorName,
                color_shade: colorShade
              }));
              setActiveModal(null);
            }}
            getColorNameFromHex={getColorNameFromHex}
            generateColorNameFromHex={generateColorNameFromHex}
            getContrastColor={getContrastColor}
          />
        )}

        {/* Feature Cards Modal */}
        <Modal
          isOpen={activeModal === 'feature-cards'}
          onClose={() => setActiveModal(null)}
          title="Product Feature Cards"
          width="900px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Product Feature Cards (Maximum 4 Cards)</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Add feature/benefit cards for this product. Each card displays text and an image icon.
          </p>
          
          {formData.feature_cards.map((card, index) => (
            <div key={index} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
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
                <LocalStateInput
                  type="text"
                  value={card.card_text || ''}
                  onCommit={(value) => {
                    const newCards = [...formData.feature_cards];
                    newCards[index] = { ...newCards[index], card_text: value, display_order: index + 1 };
                    setFormData(prev => ({ ...prev, feature_cards: newCards }));
                  }}
                  className="form-input"
                  placeholder="e.g., Supports Hormonal Balance"
                  required
                  commitOnBlur={true}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Card Image URL</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <LocalStateInput
                      type="url"
                      value={card.card_image_url || ''}
                      onCommit={(value) => {
                        const newCards = [...formData.feature_cards];
                        newCards[index] = { ...newCards[index], card_image_url: value };
                        setFormData(prev => ({ ...prev, feature_cards: newCards }));
                      }}
                      className="form-input"
                      placeholder="https://example.com/icons/card-icon.png"
                      commitOnBlur={true}
                    />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                      Enter the full URL of the card icon/image
                    </p>
                  </div>
                  {card.card_image_url && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
              Add Feature Card
            </button>
          )}
          {formData.feature_cards.length >= 4 && (
            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
              Maximum 4 feature cards allowed
            </p>
          )}
          </div>
        </Modal>

        {/* Product Images Modal */}
        <Modal
          isOpen={activeModal === 'images'}
          onClose={() => setActiveModal(null)}
          title="Product Images"
          width="800px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Product Images</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
            Add up to 5 product image URLs. These images will be displayed in product galleries and listings.
          </p>
          
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Image {num} URL</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <LocalStateInput
                    type="url"
                    value={productImages[`image${num}`] || ''}
                    onCommit={(value) => {
                      setProductImages(prev => ({
                        ...prev,
                        [`image${num}`]: value
                      }));
                    }}
                    className="form-input"
                    placeholder={`https://example.com/product-image-${num}.jpg`}
                    commitOnBlur={true}
                  />
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                    Enter the full URL of the product image
                  </p>
                </div>
                {productImages[`image${num}`] && (
                  <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
          width="900px"
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Product FAQs</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Add frequently asked questions and answers for this product. You can add unlimited FAQs.
            </p>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} style={{ marginBottom: '25px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
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
                  <LocalStateInput
                  type="text"
                    value={faq.question || ''}
                    onCommit={(value) => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[index] = { ...newFaqs[index], question: value };
                    setFormData(prev => ({
                      ...prev,
                        faqs: newFaqs
                    }));
                  }}
                  className="form-input"
                    placeholder="Enter question..."
                    commitOnBlur={true}
                />
              </div>
              <div className="form-group">
                  <label className="form-label">Answer</label>
                  <LocalStateTextarea
                    value={faq.answer || ''}
                    onCommit={(value) => {
                      const newFaqs = [...formData.faqs];
                      newFaqs[index] = { ...newFaqs[index], answer: value };
                    setFormData(prev => ({
                      ...prev,
                        faqs: newFaqs
                    }));
                  }}
                  className="form-input"
                    placeholder="Enter answer..."
                  rows="3"
                    commitOnBlur={true}
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

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', marginBottom: '30px' }}>
          <button 
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            <FiSave />
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
