import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiFilter,
  FiMoreHorizontal,
  FiChevronDown,
  FiImage,
  FiX,
  FiDollarSign,
  FiSearch
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { convertBatch } from '../services/currencyApi';
import { setSelected } from '../store/currencySlice';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';

// Actions Menu Component
const ActionsMenu = ({ productId, buttonRef, onClose, onViewDetails, onEdit, onRegionalTax, onDelete }) => {
  const menuRef = useRef(null);
  const backdropRef = useRef(null);
  const allowCloseRef = useRef(false);

  useEffect(() => {
    console.log('ActionsMenu useEffect running, productId:', productId, 'buttonRef exists:', !!buttonRef?.current);
    
    const positionMenu = () => {
      if (!menuRef.current || !buttonRef?.current) {
        console.log('Menu or button ref not ready:', { 
          menuRef: !!menuRef.current, 
          buttonRef: !!buttonRef?.current,
          productId
        });
        return;
      }

      // Get button position relative to viewport
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const menuHeight = 220;
      
      // Position horizontally - since button is in sticky right column, position menu to the left of button
      let leftPos = buttonRect.left - menuWidth - 4;
      
      // If menu would go off left edge, position to the right of button instead
      if (leftPos < 10) {
        leftPos = buttonRect.right + 4;
        // If that would go off right edge, clamp to screen edge
        if (leftPos + menuWidth > window.innerWidth - 10) {
          leftPos = Math.max(10, window.innerWidth - menuWidth - 10);
        }
      }
      
      // Position vertically - align with button top
      let topPos = buttonRect.top;
      
      // If menu would go below viewport, adjust upward
      if (topPos + menuHeight > window.innerHeight - 10) {
        topPos = Math.max(10, window.innerHeight - menuHeight - 10);
      }
      
      // Ensure menu doesn't go above viewport
      if (topPos < 10) {
        topPos = 10;
      }
      
      console.log('Positioning menu for product', productId, 'at:', { 
        top: topPos, 
        left: leftPos, 
        buttonTop: buttonRect.top,
        buttonLeft: buttonRect.left,
        buttonRight: buttonRect.right,
        buttonBottom: buttonRect.bottom
      });
      
      if (menuRef.current) {
        menuRef.current.style.top = `${topPos}px`;
        menuRef.current.style.left = `${leftPos}px`;
        menuRef.current.style.visibility = 'visible';
        menuRef.current.style.opacity = '1';
      }
    };

    // Position menu with multiple attempts to ensure it works after DOM updates
    const attemptPosition = () => {
      if (!buttonRef?.current) {
        console.log('Button ref not available yet for product', productId);
        return;
      }
      if (!menuRef.current) {
        console.log('Menu ref not available yet for product', productId);
        return;
      }
      
      // Verify the button is actually in the DOM and visible
      const buttonElement = buttonRef.current;
      if (!buttonElement || !document.body.contains(buttonElement)) {
        console.log('Button element not in DOM for product', productId);
        return;
      }
      
      positionMenu();
    };

    // Try positioning with requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      attemptPosition();
    });
    
    // Try again after delays to ensure DOM is fully updated
    const positionTimer1 = setTimeout(attemptPosition, 10);
    const positionTimer2 = setTimeout(attemptPosition, 50);
    const positionTimer3 = setTimeout(attemptPosition, 100);
    const positionTimer4 = setTimeout(attemptPosition, 200);
    
    // Allow closing after a short delay to prevent immediate closure
    const timer = setTimeout(() => {
      allowCloseRef.current = true;
    }, 100);
    
    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Handle clicks outside the menu
    const handleClickOutside = (e) => {
      // Don't close if clicking on the button that opened the menu
      if (buttonRef?.current && buttonRef.current.contains(e.target)) {
        return;
      }
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      // Only close if enough time has passed
      if (allowCloseRef.current) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    // Delay adding click listener to prevent immediate closure
    const clickTimer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 150);
    
    // Reposition on scroll
    const handleScroll = () => {
      positionMenu();
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(clickTimer);
      clearTimeout(positionTimer1);
      clearTimeout(positionTimer2);
      clearTimeout(positionTimer3);
      clearTimeout(positionTimer4);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [buttonRef, onClose, productId]);

  // Render menu using portal to escape table constraints
  console.log('ActionsMenu render - buttonRef exists:', !!buttonRef?.current, 'productId:', productId);
  
  // Don't return null immediately - let useEffect handle positioning
  // This allows the menu to render and position itself once the ref is available

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={(e) => {
          if (allowCloseRef.current && e.target === backdropRef.current) {
            onClose();
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'transparent'
        }}
      />
      {/* Menu */}
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          minWidth: '180px',
          overflow: 'hidden',
          visibility: buttonRef?.current ? 'visible' : 'hidden',
          opacity: buttonRef?.current ? '1' : '0',
          display: 'block',
          pointerEvents: buttonRef?.current ? 'auto' : 'none',
          top: '0px',
          left: '0px'
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewDetails();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '4px 7px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '7px',
            textAlign: 'left',
            color: '#1e293b',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiEye style={{ fontSize: '8px' }} /> View Details
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '4px 7px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '7px',
            textAlign: 'left',
            color: '#1e293b',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiEdit style={{ fontSize: '8px' }} /> Edit Product
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRegionalTax();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '4px 7px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '7px',
            textAlign: 'left',
            color: '#8b5cf6',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#faf5ff'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiDollarSign style={{ fontSize: '8px' }} /> Regional Tax
        </button>
        <div style={{ 
          height: '1px', 
          background: '#e2e8f0', 
          margin: '4px 0' 
        }} />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '4px 7px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: '7px',
            textAlign: 'left',
            color: '#ef4444',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <FiTrash2 style={{ fontSize: '8px' }} /> Delete Product
        </button>
      </div>
    </>
  );

  // Use portal if available, otherwise render normally
  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(menuContent, document.body);
  }
  return menuContent;
};

const Products = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState([]);
  // Don't use global Redux currency - use local country's currency instead
  const [selectedCountry, setSelectedCountry] = useState('IND'); // ✅ Use 3-letter code for consistency
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [localCurrency, setLocalCurrency] = useState('INR'); // Local currency for Products page
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [healthBenefits, setHealthBenefits] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // For subcategory filtering
  const [selectedHealthBenefitIds, setSelectedHealthBenefitIds] = useState([]);
  const [backendSearch, setBackendSearch] = useState(''); // For backend API search
  const [backendSort, setBackendSort] = useState('created_at'); // For backend API sort
  const [backendSortOrder, setBackendSortOrder] = useState('desc');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [showRegionalTaxModal, setShowRegionalTaxModal] = useState(null);
  const [regionalTaxData, setRegionalTaxData] = useState({});
  const [taxTemplates, setTaxTemplates] = useState({});
  const [showArchivedProducts, setShowArchivedProducts] = useState(false); // Toggle for archived products
  const actionButtonRefs = useRef({}); // Store refs for each product's action button
  const [taxSettings, setTaxSettings] = useState({
    show_tax_on_product: true // Default to showing tax
  });

  const activeSiteId =
    user?.site?.id ||
    user?.current_site?.id ||
    user?.site_id ||
    user?.sites?.[0]?.id ||
    null;

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'AED': 'د.إ',
      'GBP': '£',
      'EUR': '€',
      'CAD': 'C$'
    };
    return symbols[currencyCode] || currencyCode;
  };

  const formatCurrencyValue = (symbol = '', value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return `${symbol}0.00`;
    }
    return `${symbol}${Number(value).toFixed(2)}`;
  };

  const resolvePriceSummary = (product) => {
    if (!product) {
      return { subtotal: null, priceWithTax: null, taxAmount: null };
    }
    const subtotal = Number(
      product.sale_price ??
      product.regular_price ??
      (product.price_with_tax != null && product.tax_amount != null
        ? Number(product.price_with_tax) - Number(product.tax_amount)
        : 0)
    );
    const hasPriceWithTax = product.price_with_tax !== undefined && product.price_with_tax !== null;
    const priceWithTax = hasPriceWithTax
      ? Number(product.price_with_tax)
      : (product.tax_amount != null ? subtotal + Number(product.tax_amount) : null);
    const taxAmount = priceWithTax != null && subtotal != null
      ? priceWithTax - subtotal
      : (product.tax_amount != null ? Number(product.tax_amount) : null);

    return {
      subtotal: Number.isNaN(subtotal) ? null : subtotal,
      priceWithTax: priceWithTax !== null && !Number.isNaN(priceWithTax) ? priceWithTax : null,
      taxAmount: taxAmount !== null && !Number.isNaN(taxAmount) ? taxAmount : null
    };
  };

  useEffect(() => {
    fetchCurrencies();
    fetchCountries();
    fetchCategories();
    fetchHealthBenefits();
    fetchTaxSettings();
  }, []);

  const fetchTaxSettings = async () => {
    try {
      const res = await apiClient.get('/api/tax/settings');
      if (res.data?.success) {
        setTaxSettings(res.data.data || { show_tax_on_product: true });
      }
    } catch (e) {
      console.error('Error fetching tax settings:', e);
      // Default to showing tax if fetch fails
      setTaxSettings({ show_tax_on_product: true });
    }
  };

  // Handle search parameter from global search bar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      console.log('[Products] Search from URL:', searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    // Fetch products regardless of currencies - if currencies fail, still try to load products
    // This prevents infinite loading state
    fetchProducts();
  }, [
    localCurrency,
    selectedCountry,
    selectedMainCategory,
    selectedCategoryId,
    selectedHealthBenefitIds,
    backendSearch,
    backendSort,
    backendSortOrder,
    showArchivedProducts,
    activeSiteId
  ]);
  
  // Update backend search immediately when searchTerm changes (on Enter press)
  useEffect(() => {
    const trimmedSearch = searchTerm.trim();
    console.log('🔍 Search trigger (Enter pressed):', trimmedSearch);
    setBackendSearch(trimmedSearch);
  }, [searchTerm]);

  // Note: Click outside handling is now done by ActionsMenu component itself

  const fetchCurrencies = async () => {
    try {
      const response = await apiClient.get('/currencies/', {
        params: { include_inactive: true }
      });
      setCurrencies(response.data.currencies || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { fetchCountries: fetchCountriesUtil, getCurrencyForCountry } = await import('../utils/countryCurrencyUtils');
      const uniqueCountries = await fetchCountriesUtil(false); // Only active countries (no duplicates)
      
      setCountries(uniqueCountries);
      console.log(`[Products] Loaded ${uniqueCountries.length} unique countries`);
      
      // ✅ Initialize local currency based on default country (IND/India) - try both 2-letter and 3-letter
      const defaultCountry = uniqueCountries.find(c => 
        c.country_code?.toUpperCase() === 'IND' || c.country_code?.toUpperCase() === 'IN'
      );
      if (defaultCountry && defaultCountry.currency_code) {
        setLocalCurrency(defaultCountry.currency_code);
        console.log('[Products] Initialized with country IN, currency:', defaultCountry.currency_code);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/products/categories');
      const cats = response.data.categories || [];
      console.log('✅ Categories loaded:', cats.length, cats.map(c => `${c.name} (ID: ${c.id}, Parent: ${c.parent_id})`));
      setCategories(cats);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchHealthBenefits = async () => {
    try {
      const response = await apiClient.get('/health-benefits/', {
        params: { is_active: true }
      });
      setHealthBenefits(response.data.health_benefits || []);
    } catch (error) {
      console.error('Error fetching health benefits:', error);
      // Don't block product loading if health benefits fail
      setHealthBenefits([]);
    }
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    
    // ✅ CRITICAL: Auto-select the country's currency (LOCAL to Products page, not global)
    // Try exact match first, then try case-insensitive match
    const country = countries.find(c => 
      c.country_code === countryCode || 
      c.country_code?.toUpperCase() === countryCode?.toUpperCase()
    );
    
    if (country && country.currency_code) {
      setLocalCurrency(country.currency_code);
      console.log(`[Products] ✅ Country changed to ${countryCode}, currency set to: ${country.currency_code}`);
    } else {
      console.warn(`[Products] ⚠️  Country ${countryCode} not found or has no currency_code. Available countries:`, countries.map(c => `${c.country_code} (${c.currency_code})`));
      // Fallback: try to find currency from currencies list based on country code
      // This shouldn't happen if countries are loaded correctly, but handle it gracefully
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }
      
      console.log('Fetching products with token:', token.substring(0, 20) + '...');
      console.log('Making request to: /api/products/');
      
      const params = {
        currency: localCurrency,
        country_code: selectedCountry,
        include_tax: true,  // Request backend to include additive tax amounts
        include_archived: showArchivedProducts  // Include archived products if toggle is on
      };

      if (activeSiteId) {
        params.site_id = activeSiteId;
        console.log('[Products] Applying site filter:', activeSiteId);
      }

      // Add filtering parameters
      // Priority: Subcategory > Main Category
      // Only send category filter if one is explicitly selected
      if (selectedCategoryId && selectedCategoryId !== '' && selectedCategoryId !== '0') {
        // Filter by specific subcategory
        params.category_id = parseInt(selectedCategoryId); // Ensure it's an integer
        console.log('🔍 Filtering by subcategory ID:', params.category_id);
      } else if (selectedMainCategory && selectedMainCategory !== '' && selectedMainCategory !== '0') {
        // Filter by main category (will include all subcategories)
        params.category_id = parseInt(selectedMainCategory); // Ensure it's an integer
        console.log('🔍 Filtering by main category ID:', params.category_id);
      } else {
        console.log('🔍 No category filter applied - showing all products');
      }
      if (selectedHealthBenefitIds.length > 0 && selectedHealthBenefitIds[0]) {
        // Use first health benefit for now (can be enhanced to support multiple)
        params.health_benefit = parseInt(selectedHealthBenefitIds[0]);
        console.log('🔍 Filtering by health benefit ID:', params.health_benefit);
      }
      if (backendSearch && backendSearch.trim() !== '') {
        params.search = backendSearch.trim();
        console.log('🔍 Searching for:', params.search);
      } else {
        // Explicitly remove search param if empty to clear search
        delete params.search;
      }
      if (backendSort) {
        params.sort = backendSort;
        params.sort_order = backendSortOrder;
        console.log('🔍 Sorting by:', backendSort, backendSortOrder);
      }
      
      console.log('📤 API Request params:', params);

      const response = await apiClient.get('/products/', { params });
      
      console.log('Products API response status:', response.status);
      console.log('Products API response:', response.data);
      console.log('Products array:', response.data?.products);
      console.log('Products count:', response.data?.products?.length || 0);
      
      // Check if products exist in response
      if (!response.data || !response.data.products) {
        console.error('❌ No products array in API response:', response.data);
        toast.error('No products data received from server');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      if (response.data.products.length === 0) {
        console.warn('⚠️  Empty products array returned from API');
        toast.info('No products found with current filters');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Transform the data to match the expected format
      const transformedProducts = response.data.products.map((product, index) => {
        if (index === 0) {
          console.log('📦 Sample product from API:', {
            id: product.id,
            name: product.name,
            category: product.category,
            health_benefits: product.health_benefits?.length || 0
          });
        }
        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category ? product.category.name : 'Uncategorized',
          category_id: product.category ? product.category.id : null,
          original_category: product.category ? product.category.name : 'Uncategorized',
          color_name: product.color_name || '',
          color_shade: product.color_shade || '#000000',
          stock_status: product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock',
          regular_price: product.sale_price || product.base_price,
          sale_price: product.sale_price || product.base_price,
          display_currency: localCurrency,
          currency_symbol: getCurrencySymbol(localCurrency),
          tax_rate: product.tax_rate,
          tax_amount: product.tax_amount,
          price_with_tax: product.price_with_tax,
          is_taxable: product.is_taxable,
          regional_tax_rates: product.regional_tax_rates,
          image: product.image_url || product.thumbnail_url || product.image1 || null,
          created_at: product.created_at,
          stock_quantity: product.stock_quantity,
          is_active: product.is_active,
          featured: product.featured,
          is_grouped_product: product.is_grouped_product || false,
          product_type: product.product_type || 'simple',
          health_benefits: product.health_benefits || []
        };
      });
      
      console.log('Transformed products with tax data:');
      transformedProducts.forEach(product => {
        if (product.tax_amount !== undefined) {
          console.log(`Product ${product.id} (${product.name}): Tax Rate: ${product.tax_rate}%, Tax Amount: ${product.tax_amount}`);
        }
        // Debug image URLs
        if (!product.image) {
          console.warn(`⚠️ Product ${product.id} (${product.name}): No image URL found. Available fields:`, {
            image_url: product.image_url,
            thumbnail_url: product.thumbnail_url,
            image1: product.image1,
            image2: product.image2
          });
        } else {
          console.log(`✅ Product ${product.id} (${product.name}): Image URL: ${product.image}`);
        }
      });
      
      console.log(`✅ Successfully loaded ${transformedProducts.length} products`);
      console.log('📦 First 3 products:', transformedProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        category_id: p.category_id
      })));
      // Backend already converted prices based on localCurrency parameter
      // No need to convert again - use the prices directly!
      console.log('✅ Using backend-converted prices for currency:', localCurrency);
      
      // Add currency symbol to products
      const productsWithSymbol = transformedProducts.map(p => ({
        ...p,
        currency_symbol: p.currency_symbol || getCurrencySymbol(localCurrency),
        display_currency: localCurrency
      }));
      
      setProducts(productsWithSymbol);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error response:', error.response?.data);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Products endpoint not found. Check backend is running.');
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to backend. Is the server running on port 5000?');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load products');
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        console.log('[Products] Deleting product ID:', productId);
        
        const response = await apiClient.delete(`/products/${productId}`);
        
        console.log('[Products] Delete response:', response.data);
        
        // Check if product was archived or deleted
        if (response.data.action === 'archived') {
          const forceDelete = window.confirm('This product has existing orders and was archived instead of deleted. Do you want to permanently delete it (this will remove associated order line items)?');
          if (forceDelete) {
            await apiClient.delete(`/products/${productId}`, {
              params: { force: true }
            });
            toast.success('✓ Product and related order items deleted permanently.');
          } else {
            toast.success('✓ Product archived and hidden from storefront.');
          }
        } else {
          toast.success('✓ Product deleted successfully!');
        }
        
        // Force refresh products list
        await fetchProducts();
        
        // Also force a page state update to ensure UI refreshes
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        
        // Trigger immediate notification refresh
        window.dispatchEvent(new Event('productDeleted'));
        
      } catch (error) {
        console.error('Error deleting product:', error);
        console.error('Error response:', error.response?.data);
        
        const errorData = error.response?.data || {};
        const errorMessage = errorData.error || errorData.message || 'Failed to delete product';
        const errorDetails = errorData.details || '';
        const suggestion = errorData.suggestion || '';
        
        // Show comprehensive error message
        if (suggestion) {
          toast.error(`${errorMessage}\n${suggestion}`);
        } else if (errorDetails) {
          toast.error(`${errorMessage}\n${errorDetails}`);
        } else {
          toast.error(errorMessage);
        }
      }
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      
      const product = response.data.product;
      
      // Show details for all products
      setViewingProduct(product);
      
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    }
  };


  // Regional Tax Functions
  const handleOpenRegionalTax = async (product) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch tax templates for all countries
      const countriesPromises = countries.map(country =>
        apiClient.get('/tax-templates/', {
          params: { country_code: country.country_code }
        })
      );
      const templatesResults = await Promise.all(countriesPromises);
      const templatesMap = {};
      templatesResults.forEach((res, idx) => {
        const country = countries[idx];
        templatesMap[country.country_code] = res.data.tax_templates || [];
      });
      setTaxTemplates(templatesMap);

      // Fetch existing regional overrides for this product
      const overridesRes = await apiClient.get('/product-regional-overrides/', {
        params: { product_id: product.id },
        headers
      });
      
      const overridesMap = {};
      (overridesRes.data.regional_overrides || []).forEach(override => {
        overridesMap[override.country_code] = override;
      });
      setRegionalTaxData(overridesMap);
      setShowRegionalTaxModal(product);
    } catch (error) {
      console.error('Error fetching regional tax data:', error);
      toast.error('Failed to load regional tax data');
    }
  };

  // ✅ CRITICAL: Normalize country code to 3-letter format for consistency with backend
  const normalizeCountryCode = (code) => {
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

  const handleSaveRegionalTax = async (countryCode, taxRate) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const product = showRegionalTaxModal;

      // ✅ CRITICAL: Normalize country code to 3-letter format (IN -> IND)
      const normalizedCode = normalizeCountryCode(countryCode);
      console.log(`[Regional Tax Save] Normalizing ${countryCode} -> ${normalizedCode}, taxRate=${taxRate}`);

      // Find existing override using normalized code (check both original and normalized)
      const existing = regionalTaxData[countryCode] || regionalTaxData[normalizedCode];

      if (existing) {
        // Update existing - ✅ CRITICAL: Also set use_country_default_tax to false when setting override
        await apiClient.put(
          `/product-regional-overrides/${existing.id}`,
          { 
            tax_rate_override: taxRate,
            use_country_default_tax: false,  // ✅ Ensure override is used, not country default
            country_code: normalizedCode  // ✅ Ensure normalized code is sent
          },
          { headers }
        );
        console.log(`[Regional Tax Save] Updated override ID ${existing.id} for ${normalizedCode} with rate ${taxRate}%`);
      } else {
        // Create new
        const country = countries.find(c => c.country_code === countryCode || c.country_code === normalizedCode);
        await apiClient.post(
          '/product-regional-overrides/',
          {
            product_id: product.id,
            country_code: normalizedCode,  // ✅ Always use normalized code
            currency_code: country?.currency_code || 'INR',
            tax_rate_override: taxRate,
            use_country_default_tax: false
          },
          { headers }
        );
        console.log(`[Regional Tax Save] Created new override for ${normalizedCode} with rate ${taxRate}%`);
      }

      toast.success(`Tax rate updated for ${normalizedCode}`);
      // Refresh the modal data
      handleOpenRegionalTax(product);
    } catch (error) {
      console.error('Error saving regional tax:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to save tax override');
    }
  };

  // Helper function to get all ancestors of a category
  const getCategoryAncestors = (categoryName) => {
    const cat = categories.find(c => c.name === categoryName);
    if (!cat) return [categoryName];
    
    const ancestors = [categoryName];
    let current = cat;
    
    while (current && current.parent_id) {
      const parent = categories.find(c => c.id === current.parent_id);
      if (parent) {
        ancestors.push(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    
    return ancestors;
  };

  // Helper function to check if a product belongs to a category hierarchy
  const productBelongsToCategory = (product, mainCategoryName, subCategoryName = '') => {
    if (!product.category) return false;
    
    // Find the product's category in the categories list
    const productCategory = categories.find(cat => cat.name === product.category);
    if (!productCategory) return false;
    
    // Get all ancestors of the product's category
    const productAncestors = getCategoryAncestors(product.category);
    
    // If subcategory is specified, check if it matches (including nested subcategories)
    if (subCategoryName) {
      // For Health Benefits, check the health_benefits array
      if (mainCategoryName === 'Health Benefits') {
        const benefitNames = product.health_benefits?.map(b => b.name) || [];
        return benefitNames.includes(subCategoryName);
      }
      
      // Check if the product's category or any of its ancestors matches the subcategory
      return productAncestors.includes(subCategoryName);
    }
    
    // Check if product belongs to the main category (via any ancestor)
    if (mainCategoryName === 'Health Supplements') {
      // Product's category or any ancestor should be Essential Supplements or Specialized Supplements
      const healthSupplementSubcats = ['Essential Supplements', 'Specialized Supplements'];
      return productAncestors.some(ancestor => healthSupplementSubcats.includes(ancestor));
    } else if (mainCategoryName === 'Cosmetics') {
      return productAncestors.includes('Cosmetics');
    } else if (mainCategoryName === 'Honey') {
      return productAncestors.includes('Honey');
    }
    
    return false;
  };

  // NOTE: Filtering is now done on the backend via API calls
  // Frontend just displays the filtered results from API
  // No client-side filtering needed - backend handles category, health benefit, and search filters
  
  // Use products directly from API (already filtered by backend)
const filteredProducts = products;
const viewingPriceSummary = viewingProduct ? resolvePriceSummary(viewingProduct) : null;
const filterPanelBackground = isDark ? 'rgba(15, 17, 27, 0.95)' : '#f8fafc';
const filterPanelBorder = isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '2px solid #e2e8f0';

  const activeCountry =
    countries.find((country) => country.country_code === selectedCountry);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    return countries.filter((country) => {
      const label = `${country.country_name || country.countryName || ''} ${country.country_code}`;
      return label.toLowerCase().includes(countrySearch.toLowerCase());
    });
  }, [countries, countrySearch]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '161px' }}>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage catalog inventory, pricing, and availability</p>
        </div>

        <div className="page-header-actions">
          <span className="currency-chip">
            Currency: {localCurrency}
          </span>
          <button
            type="button"
            className="pill-switcher"
            onClick={() => setCountryModalOpen(true)}
          >
            <div className="currency-switcher__chip">
              {(activeCountry?.country_code || 'IN').slice(0, 2)}
            </div>
            <div className="currency-switcher__details">
              <span className="currency-switcher__label">Country</span>
              <span className="currency-switcher__value">
                {activeCountry?.country_name || 'Select Country'} ({selectedCountry})
              </span>
            </div>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products/add')}
          >
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {countryModalOpen && (
        <div className="pill-modal" onClick={() => setCountryModalOpen(false)}>
          <div className="pill-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="pill-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="pill-switcher__label" style={{ marginBottom: '4px' }}>Choose country</p>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Drive pricing & tax context per market</h3>
              </div>
              <button
                type="button"
                aria-label="Close country selector"
                onClick={() => setCountryModalOpen(false)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '8px' }}
              >
                <FiX />
              </button>
            </div>
            <div className="pill-modal__body">
              <div style={{ position: 'relative' }}>
                <FiSearch
                  size={18}
                  style={{ position: 'absolute', top: '50%', left: '14px', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  className="pill-modal__search"
                  placeholder="Search markets..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  style={{ paddingLeft: '28px' }}
                />
              </div>
              <div className="pill-modal__grid" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {filteredCountries.map((country) => (
                  <button
                    key={country.country_code}
                    type="button"
                    className="pill-modal__option"
                    onClick={() => {
                      handleCountryChange(country.country_code);
                      setCountryModalOpen(false);
                      setCountrySearch('');
                    }}
                    style={{ border: country.country_code === selectedCountry ? '2px solid rgba(248,181,0,0.45)' : undefined }}
                  >
                    <div>
                      <div className="pill-modal__option-title">{country.country_name}</div>
                      <div className="pill-modal__option-subtitle">
                        {country.currency_code} · {country.region || 'Global'}
                      </div>
                    </div>
                    {country.country_code === selectedCountry && (
                      <span className="pill-modal__option-symbol">Active</span>
                    )}
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '8px 0' }}>
                    No countries match “{countrySearch}”
                  </p>
                )}
              </div>
            </div>
            <div className="pill-modal__footer">
              <button className="btn btn-secondary" type="button" onClick={() => setCountryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '14px' }}>
        <SearchBar
            value={searchTerm}
            onChange={(e) => {
              // SearchBar handles local state, just update parent state
              const value = e.target?.value || '';
              setSearchTerm(value);
            }}
          placeholder="Search by product name, SKU, or description..."
          onClear={() => {
            setSearchTerm('');
            setBackendSearch('');
          }}
          inputProps={{
            autoComplete: 'off'
          }}
        />
      </div>

      {/* Product Filters */}
      <div
        className="card filter-panel"
        style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          marginBottom: '14px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden'
        }}
      >
        <div className="filter-panel-inner" style={{ padding: '8px 12px' }}>
          <div className="filter-panel-header" style={{ 
            marginBottom: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingBottom: '6px', 
            borderBottom: '1px solid #f1f5f9' 
          }}>
            <h3 style={{ 
              fontSize: '6px', 
              marginBottom: '0', 
              fontWeight: '400', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2px', 
              color: isDark ? '#94a3b8' : '#64748b', 
              lineHeight: '1.2',
              letterSpacing: '-0.01em'
            }}>
              <FiFilter style={{ fontSize: '5px', color: isDark ? '#94a3b8' : '#64748b' }} /> Filter Products
            </h3>
            {(selectedMainCategory || selectedCategoryId || selectedHealthBenefitIds.length > 0 || searchTerm || showArchivedProducts) && (
              <button
                onClick={() => {
                  setSelectedMainCategory('');
                  setSelectedCategoryId('');
                  setSelectedHealthBenefitIds([]);
                  setSearchTerm('');
                  setSelectedSubCategory('');
                  setShowArchivedProducts(false);
                }}
                style={{
                  padding: '3px 8px',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: '1px solid #fca5a5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '8px',
                  fontWeight: '600',
                  color: '#dc2626',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(220, 38, 38, 0.2)';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(220, 38, 38, 0.1)';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
              >
                <FiX size={11} /> Reset All
              </button>
            )}
          </div>
          
          <div className="filter-panel-grid" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', overflowX: 'auto' }}>
            <div className="filter-panel-grid__main" style={{ gap: '8px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', flex: 1, minWidth: 0 }}>
            {/* Main Category Filter */}
            <div className="filter-chip" style={{ 
              padding: '4px 10px', 
              gap: '6px', 
              borderRadius: '5px', 
              display: 'flex', 
              alignItems: 'center', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s ease',
              minHeight: '24px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <label style={{ fontSize: '6px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Main Category</label>
              <select
                value={selectedMainCategory || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Main category changed to:', value);
                  setSelectedMainCategory(value);
                  setSelectedCategoryId(''); // Reset subcategory when main category changes
                  // Don't auto-select subcategory - let user choose or leave empty for "all subcategories"
                }}
                className="form-select filter-select"
                style={{ fontSize: '6px', minWidth: '110px', padding: '0 18px 0 4px', border: 'none', outline: 'none', background: 'transparent', fontWeight: '500', color: '#1e293b', cursor: 'pointer' }}
              >
                <option value="">All Categories</option>
                {categories.filter(cat => !cat.parent_id).map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Subcategory Filter (only show if Health Supplements is selected) */}
            {selectedMainCategory && (() => {
              const mainCatId = parseInt(selectedMainCategory);
              const mainCat = categories.find(c => c.id === mainCatId);
              console.log('Main category lookup:', { selectedMainCategory, mainCatId, mainCat: mainCat?.name });
              const subcategories = mainCat ? categories.filter(c => {
                // Handle both string and int parent_id
                const parentMatch = c.parent_id === mainCatId || parseInt(c.parent_id) === mainCatId;
                return parentMatch;
              }) : [];
              console.log('Subcategories found:', subcategories.length, subcategories.map(c => c.name));
              
              if (subcategories.length > 0) {
                return (
                  <div className="filter-chip" style={{ 
                    padding: '4px 10px', 
                    gap: '6px', 
                    borderRadius: '5px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    minHeight: '24px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >
                    <label style={{ fontSize: '6px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Subcategory</label>
                    <select
                      value={selectedCategoryId || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('Subcategory changed to:', value);
                        setSelectedCategoryId(value);
                      }}
                      className="form-select filter-select"
                      style={{ fontSize: '8px', minWidth: '110px', padding: '0 18px 0 4px', border: 'none', outline: 'none', background: 'transparent', fontWeight: '500', color: '#1e293b', cursor: 'pointer' }}
                    >
                      <option value="">All {mainCat?.name}</option>
                      {subcategories.map(cat => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Health Benefits Filter */}
            <div className="filter-chip" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              padding: '4px 10px', 
              borderRadius: '5px', 
              border: '1px solid #e2e8f0',
              position: 'relative',
              zIndex: 1000,
              transition: 'all 0.2s ease',
              minHeight: '24px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <label style={{ fontSize: '6px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>Health Benefit:</label>
              <select
                value={selectedHealthBenefitIds[0] || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Health benefit changed to:', value);
                  setSelectedHealthBenefitIds(value ? [parseInt(value)] : []);
                }}
                className="form-select"
                style={{ 
                  width: '130px', 
                  border: 'none', 
                  outline: 'none', 
                  fontSize: '6px',
                  position: 'relative',
                  zIndex: 1000,
                  backgroundColor: 'transparent',
                  fontWeight: '500',
                  padding: '0 18px 0 4px',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
                disabled={healthBenefits.length === 0}
              >
                <option value="">
                  {healthBenefits.length === 0 ? 'Loading...' : 'All Health Benefits'}
                </option>
                {(() => {
                  // Only show the 8 main categories
                  const mainCategories = [
                    'Immunity Booster',
                    'Sleep Support',
                    'Stress & Anxiety Relief',
                    "Men's Health",
                    "Women's Health",
                    'Beauty & Radiance',
                    'Healthy Ageing',
                    'Sports & Fitness'
                  ];
                  
                  // Filter and sort only main categories
                  const main = healthBenefits.filter(hb => mainCategories.includes(hb.name));
                  const sortedMain = main.sort((a, b) => {
                    return mainCategories.indexOf(a.name) - mainCategories.indexOf(b.name);
                  });
                  
                  return sortedMain.map(hb => (
                    <option key={hb.id} value={hb.id}>{hb.name}</option>
                  ));
                })()}
              </select>
            </div>
            
            {/* Show Archived Toggle */}
            <div className="filter-chip" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: showArchivedProducts 
                ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              padding: '4px 10px', 
              borderRadius: '5px', 
              border: showArchivedProducts ? '1px solid #f59e0b' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '24px',
              boxShadow: showArchivedProducts 
                ? '0 2px 4px rgba(245, 158, 11, 0.2)' 
                : '0 1px 2px rgba(0, 0, 0, 0.04)',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={() => setShowArchivedProducts(!showArchivedProducts)}
            onMouseEnter={(e) => {
              if (!showArchivedProducts) {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              } else {
                e.currentTarget.style.boxShadow = '0 3px 6px rgba(245, 158, 11, 0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showArchivedProducts) {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              } else {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            >
              <input
                type="checkbox"
                checked={showArchivedProducts}
                onChange={(e) => {
                  e.stopPropagation();
                  setShowArchivedProducts(e.target.checked);
                }}
                style={{ cursor: 'pointer', width: '12px', height: '12px', accentColor: '#f59e0b' }}
              />
              <label style={{ fontSize: '6px', fontWeight: '600', color: showArchivedProducts ? '#92400e' : '#475569', cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: '1.2', letterSpacing: '-0.01em' }}>
                📦 Archived Products Only
              </label>
            </div>
            </div>
            
            {/* Sorting Controls on the Right */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
              <select 
                className="form-select" 
                style={{ 
                  width: '120px',
                  padding: '4px 8px',
                  fontSize: '8px',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#1e293b',
                  minHeight: '22px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
                value={backendSort}
                onChange={(e) => {
                  setBackendSort(e.target.value);
                  if (e.target.value === 'price' || e.target.value === 'stock') {
                    setBackendSortOrder('asc');
                  } else {
                    setBackendSortOrder('desc');
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <option value="created_at">Sort by Newest</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
              
              <select 
                className="form-select" 
                style={{ 
                  width: '55px',
                  padding: '4px 6px',
                  fontSize: '8px',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#1e293b',
                  minHeight: '22px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              
              {selectedProducts.length > 0 && (
                <button className="btn btn-secondary">
                  Actions <FiChevronDown />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Products Table */}
      <div className="table-container" style={{ 
        overflowX: 'hidden', 
        overflowY: 'visible',
        width: '100%',
        position: 'relative',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ overflowX: 'hidden', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <table className="table" style={{ 
            width: '100%',
            tableLayout: 'auto',
            borderCollapse: 'collapse'
          }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ width: '25px', padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    style={{ width: '10px', height: '10px', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>ID</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>PHOTO</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>NAME</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>SKU</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>TYPE</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>CATEGORY</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>HEALTH BENEFITS</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>COLOR</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>STOCK</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>PRICE</th>
                <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>FINAL PRICE</th>
                <th style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>TAXABLE</th>
                {taxSettings.show_tax_on_product && (
                  <th style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap' }}>TAX RATE</th>
                )}
                <th style={{ padding: '4px 6px', textAlign: 'right', fontWeight: '700', color: '#1e293b', fontSize: '9px', whiteSpace: 'nowrap', minWidth: '50px' }}>ACTIONS</th>
              </tr>
            </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={taxSettings.show_tax_on_product ? 15 : 14} style={{ padding: '20px 16px', textAlign: 'center', color: '#64748b' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>No Products Found</p>
                  <p style={{ fontSize: '10px' }}>
                    {loading ? 'Loading products...' : 'Try adjusting your filters or add new products.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => {
                console.log('🟡 Rendering product row:', product.id, product.name);
                const priceSummary = resolvePriceSummary(product);
                const taxAmountDisplay = priceSummary.taxAmount != null ? Math.max(priceSummary.taxAmount, 0) : null;
                // Get or create ref for this product's action button
                if (!actionButtonRefs.current[product.id]) {
                  actionButtonRefs.current[product.id] = React.createRef();
                }
                const actionButtonRef = actionButtonRefs.current[product.id];
                return (
              <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6px 8px' }}>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '4px 6px', fontSize: '7px', color: '#64748b' }}>{index + 1}</td>
                <td style={{ padding: '4px 6px' }}>
                  <div className="product-image-container" style={{
                    width: '24px',
                    height: '24px',
                    background: isDark ? '#1e293b' : '#f8fafc',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: isDark ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid #e2e8f0',
                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.04)'
                  }}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', product.image, 'for product:', product.name);
                          e.target.style.display = 'none';
                          const placeholder = e.target.nextElementSibling;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="product-image-placeholder" style={{ 
                      display: product.image ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontSize: '10px'
                    }}>
                      <FiImage />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '4px 6px', fontWeight: '500', fontSize: '7px', color: '#1e293b' }}>
                  {product.name}
                  {!product.is_active && (
                    <span style={{
                      marginLeft: '4px',
                      padding: '1px 4px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '6px',
                      fontSize: '6px',
                      fontWeight: '600'
                    }}>
                      ARCHIVED
                    </span>
                  )}
                </td>
                <td style={{ padding: '4px 6px', fontSize: '7px', color: '#64748b', fontFamily: 'monospace' }}>{product.sku}</td>
                <td style={{ padding: '4px 6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className={`status-badge ${product.product_type === 'simple' ? 'status-active' : 'status-pending'}`} style={{ fontSize: '6px', padding: '1px 4px' }}>
                      {product.product_type ? product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1) : 'Simple'}
                    </span>
                    {product.is_grouped_product && (
                      <span className="status-badge" style={{ 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        fontSize: '6px',
                        padding: '1px 4px'
                      }}>
                        Grouped
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '4px 6px', fontSize: '7px', color: '#1e293b' }}>{product.category}</td>
                <td style={{ padding: '4px 6px' }}>
                  {product.health_benefits && product.health_benefits.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', maxWidth: '150px' }}>
                      {product.health_benefits.slice(0, 2).map((hb, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '1px 4px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '6px',
                            fontSize: '6px',
                            fontWeight: '500'
                          }}
                          title={hb.name}
                        >
                          {hb.name}
                        </span>
                      ))}
                      {product.health_benefits.length > 2 && (
                        <span
                          style={{
                            padding: '1px 4px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            borderRadius: '6px',
                            fontSize: '6px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                          title={product.health_benefits.map(hb => hb.name).join(', ')}
                        >
                          +{product.health_benefits.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '7px' }}>None</span>
                  )}
                </td>
                <td style={{ padding: '4px 6px' }}>
                  {product.color_name ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
                        backgroundColor: product.color_shade,
                        flexShrink: 0,
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)'
                      }} />
                      <span style={{ fontSize: '7px', color: '#1e293b' }}>{product.color_name}</span>
                    </div>
                  ) : (
                    <span style={{ color: isDark ? '#8b949e' : '#64748b', fontStyle: 'italic', fontSize: '7px' }}>No color</span>
                  )}
                </td>
                <td style={{ padding: '4px 6px' }}>
                  <span className={`status-badge ${product.stock_status === 'In Stock' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '6px', padding: '1px 4px' }}>
                    {product.stock_status}
                  </span>
                </td>
                <td style={{ padding: '4px 6px' }}>
                  <div>
                    {product.sale_price && product.sale_price !== product.regular_price ? (
                      <>
                        <div style={{ 
                          textDecoration: 'line-through', 
                          color: '#64748b', 
                          fontSize: '6px',
                          marginBottom: '1px'
                        }}>
                          {product.currency_symbol}{product.regular_price.toFixed(2)}
                        </div>
                        <div style={{ fontWeight: '600', color: '#ef4444', fontSize: '7px' }}>
                          {product.currency_symbol}{product.sale_price.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#1e293b',
                          fontSize: '7px'
                        }}>
                          {product.currency_symbol}{product.regular_price.toFixed(2)}
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td style={{ padding: '4px 6px' }}>
                  {priceSummary.priceWithTax != null ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '7px' }}>
                        {formatCurrencyValue(product.currency_symbol, priceSummary.priceWithTax)}
                      </div>
                      <div style={{ fontSize: '6px', color: '#64748b' }}>
                        Includes {formatCurrencyValue(product.currency_symbol, taxAmountDisplay ?? 0)}
                        {product.tax_rate ? ` tax (${Number(product.tax_rate).toFixed(2)}% for ${selectedCountry})` : ''}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '7px' }}>N/A</span>
                  )}
                </td>
                <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                  <span className={`status-badge ${product.is_taxable ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '6px', padding: '1px 4px' }}>
                    {product.is_taxable ? 'Yes' : 'No'}
                  </span>
                </td>
                {taxSettings.show_tax_on_product && (
                  <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                    {product.is_taxable ? (
                      <span style={{
                        padding: '2px 4px',
                        background: isDark ? '#1c2128' : '#f0f9ff',
                        color: isDark ? '#79c0ff' : '#0369a1',
                        borderRadius: '4px',
                        fontSize: '6px',
                        fontWeight: '600',
                        border: `1px solid ${isDark ? '#30363d' : '#bae6fd'}`
                      }}>
                        {product.tax_rate !== null && product.tax_rate !== undefined ? `${Number(product.tax_rate).toFixed(2)}%` : '0%'}
                      </span>
                    ) : (
                      <span style={{ 
                        color: isDark ? '#8b949e' : '#94a3b8', 
                        fontStyle: 'italic',
                        fontSize: '7px'
                      }}>
                        N/A
                      </span>
                    )}
                  </td>
                )}
                <td style={{ 
                  width: '50px', 
                  minWidth: '50px',
                  maxWidth: '50px',
                  position: 'sticky',
                  right: 0,
                  zIndex: 1000,
                  padding: '4px 6px',
                  background: 'white'
                }}>
                  <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <button 
                      ref={actionButtonRef}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '3px 6px', 
                        fontSize: '8px',
                        width: '100%',
                        minWidth: '28px',
                        minHeight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Toggle menu
                        const newState = showActionsMenu === product.id ? null : product.id;
                        setShowActionsMenu(newState);
                      }}
                      title="More Actions"
                    >
                      <FiMoreHorizontal />
                    </button>
                    
                    {showActionsMenu === product.id && (
                      <ActionsMenu
                          key={`actions-menu-${product.id}`}
                          productId={product.id}
                          buttonRef={actionButtonRef}
                          onClose={() => {
                            console.log('Closing menu from onClose for product', product.id);
                            setShowActionsMenu(null);
                          }}
                        onViewDetails={() => {
                          setShowActionsMenu(null);
                          handleViewProduct(product.id);
                        }}
                        onEdit={() => {
                          setShowActionsMenu(null);
                          window.location.href = `/products/edit/${product.id}`;
                        }}
                        onRegionalTax={() => {
                          setShowActionsMenu(null);
                          handleOpenRegionalTax(product);
                        }}
                        onDelete={() => {
                          setShowActionsMenu(null);
                          handleDelete(product.id);
                        }}
                      />
                    )}
                  </div>
                </td>
              </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>


      {/* Product Details Modal - Show for all products */}
      {viewingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '13px'
        }}
        onClick={() => setViewingProduct(null)}
        >
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '13px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Product Details</h2>
              <button
                onClick={() => setViewingProduct(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px'
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '13px' }}>
              {/* Product Image */}
              {viewingProduct.image_url && (
                <div style={{ 
                  marginBottom: '13px', 
                  textAlign: 'center',
                  background: '#f8fafc',
                  padding: '13px',
                  borderRadius: '8px'
                }}>
                  <img 
                    src={viewingProduct.image_url} 
                    alt={viewingProduct.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '201px',
                      borderRadius: '5px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}

              {/* Basic Information */}
              <div style={{ marginBottom: '17px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Product Name</label>
                    <div style={{ fontSize: '9px', fontWeight: '500' }}>{viewingProduct.name}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Product Type</label>
                    <span className={`status-badge ${viewingProduct.product_type === 'simple' ? 'status-active' : 'status-pending'}`}>
                      {viewingProduct.product_type ? viewingProduct.product_type.charAt(0).toUpperCase() + viewingProduct.product_type.slice(1) : 'Simple'}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>SKU</label>
                    <div style={{ fontSize: '9px', fontWeight: '500' }}>{viewingProduct.sku}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Category</label>
                    <div style={{ fontSize: '9px', fontWeight: '500' }}>
                      {viewingProduct.category ? viewingProduct.category.name : 'Uncategorized'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Status</label>
                    <span className={`status-badge ${viewingProduct.is_active ? 'status-active' : 'status-inactive'}`}>
                      {viewingProduct.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div style={{ marginBottom: '17px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                  Pricing & Currency
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Base Price</label>
                    <div style={{ fontSize: '8px', fontWeight: '600', color: '#FF8C00' }}>
                      {viewingProduct.base_currency} {viewingProduct.base_price}
                    </div>
                  </div>
                  {viewingProduct.sale_price && (
                    <div>
                      <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Sale Price</label>
                      <div style={{ fontSize: '8px', fontWeight: '600', color: '#ef4444' }}>
                        {viewingProduct.base_currency} {viewingProduct.sale_price}
                      </div>
                    </div>
                  )}
                  {viewingPriceSummary?.priceWithTax != null && (
                    <div>
                      <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>
                        Total Price (incl. tax) — {selectedCountry}
                      </label>
                      <div style={{ fontSize: '8px', fontWeight: '600', color: '#16a34a' }}>
                        {formatCurrencyValue(viewingProduct.currency_symbol || getCurrencySymbol(localCurrency), viewingPriceSummary.priceWithTax)}
                      </div>
                      <div style={{ fontSize: '8px', color: '#6b7280' }}>
                        Includes {formatCurrencyValue(viewingProduct.currency_symbol || getCurrencySymbol(localCurrency), viewingPriceSummary.taxAmount ?? 0)}
                        {viewingProduct.tax_rate ? ` tax (${Number(viewingProduct.tax_rate).toFixed(2)}%)` : ''}
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Base Currency</label>
                    <div style={{ fontSize: '9px', fontWeight: '500' }}>{viewingProduct.base_currency}</div>
                  </div>
                </div>
              </div>

              {/* Variable Product Attributes */}
              {viewingProduct.product_type === 'variable' && (
                <div style={{ marginBottom: '17px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                    Product Variations
                  </h3>
                  <div style={{ 
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '7px' }}>
                      This is a variable product with multiple variations (size, color, etc.)
                    </div>
                    {viewingProduct.variations && viewingProduct.variations.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {viewingProduct.variations.map((variation, index) => (
                          <div key={index} style={{ 
                            padding: '7px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ fontSize: '8px', fontWeight: '600', marginBottom: '3px' }}>
                              Variation {index + 1}
                            </div>
                            <div style={{ fontSize: '8px', color: '#64748b' }}>
                              SKU: {variation.sku} | Price: {variation.price} | Stock: {variation.stock}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '8px', color: '#64748b', fontStyle: 'italic' }}>
                        No variations defined yet
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Tax Information */}
              <div style={{ marginBottom: '17px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                  Tax Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Taxable</label>
                    <span className={`status-badge ${viewingProduct.is_taxable ? 'status-active' : 'status-inactive'}`}>
                      {viewingProduct.is_taxable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {viewingProduct.tax_rate && (
                    <div>
                      <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Product Tax Rate</label>
                      <div style={{ fontSize: '6px', fontWeight: '600', color: '#8b5cf6' }}>
                        {viewingProduct.tax_rate}%
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Regional Tax Rates */}
                {viewingProduct.regional_tax_rates && Object.keys(viewingProduct.regional_tax_rates).length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '7px' }}>
                      Regional Tax Rates
                    </label>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '10px',
                      padding: '10px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {Object.entries(viewingProduct.regional_tax_rates).map(([countryCode, taxRate]) => (
                        <div key={countryCode} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '4px 5px',
                          background: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <span style={{ fontSize: '8px', fontWeight: '500' }}>{countryCode}</span>
                          <span style={{ fontSize: '8px', fontWeight: '600', color: '#8b5cf6' }}>
                            {taxRate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Information */}
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                  Stock & Inventory
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Stock Quantity</label>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: viewingProduct.stock_quantity > 0 ? '#10b981' : '#ef4444' }}>
                      {viewingProduct.stock_quantity} units
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Min Order Quantity</label>
                    <div style={{ fontSize: '6px', fontWeight: '500' }}>{viewingProduct.min_order_quantity} units</div>
                  </div>
                  {viewingProduct.max_order_quantity && (
                    <div>
                      <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Max Order Quantity</label>
                      <div style={{ fontSize: '6px', fontWeight: '500' }}>{viewingProduct.max_order_quantity} units</div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Featured</label>
                    <span className={`status-badge ${viewingProduct.featured ? 'status-active' : 'status-pending'}`}>
                      {viewingProduct.featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingProduct.description && (
                <div style={{ marginBottom: '17px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                    Description
                  </h3>
                  <div style={{ 
                    fontSize: '7px', 
                    color: '#475569',
                    lineHeight: '1.6',
                    padding: '10px',
                    background: '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    {viewingProduct.description}
                  </div>
                </div>
              )}

              {/* Rewards */}
              {viewingProduct.reward_points > 0 && (
                <div style={{ marginBottom: '17px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '10px', color: '#1e293b' }}>
                    Rewards
                  </h3>
                  <div>
                    <label style={{ fontSize: '8px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Reward Points</label>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b' }}>
                      {viewingProduct.reward_points} points
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div style={{ 
                padding: '15px',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '8px',
                color: '#64748b'
              }}>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Created:</strong> {new Date(viewingProduct.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(viewingProduct.updated_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '13px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              position: 'sticky',
              bottom: 0,
              background: 'white'
            }}>
              <button
                onClick={() => setViewingProduct(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => window.location.href = `/products/edit/${viewingProduct.id}`}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <FiEdit /> Edit Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regional Tax Modal */}
      {showRegionalTaxModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '11px', fontWeight: '600' }}>
                  Regional Tax Rates
                </h2>
                <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '9px' }}>
                  {showRegionalTaxModal.name}
                </p>
              </div>
              <button
                onClick={() => setShowRegionalTaxModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '9px' }}>
                  <strong>💡 Tip:</strong> Set different tax rates for each country. If not set, the product will use the default tax rate configured in the product settings.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {countries.map(country => {
                  // ✅ CRITICAL: Normalize country code to find override (check both original and normalized)
                  const normalizedCode = normalizeCountryCode(country.country_code);
                  const override = regionalTaxData[country.country_code] || regionalTaxData[normalizedCode];
                  const templates = taxTemplates[country.country_code] || taxTemplates[normalizedCode] || [];
                  
                  // Handle tax_rate_override properly - check for null, undefined, and numeric values
                  let currentTaxRate = '';
                  if (override && override.tax_rate_override !== null && override.tax_rate_override !== undefined) {
                    // Convert to number and ensure it matches template values
                    currentTaxRate = parseFloat(override.tax_rate_override);
                  }
                  
                  // Debug logging
                  if (override) {
                    console.log(`[Regional Tax Modal] ${country.country_code} (normalized: ${normalizedCode}): override exists, tax_rate_override=${override.tax_rate_override}, currentTaxRate=${currentTaxRate}, use_country_default_tax=${override.use_country_default_tax}`);
                  }

                  return (
                    <div key={country.country_code} style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '3px' }}>
                          {country.country_name}
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>
                          {country.country_code} {normalizedCode !== country.country_code && `(${normalizedCode})`} • Currency: {country.currency_code}
                          {override && override.tax_rate_override !== null && override.tax_rate_override !== undefined && !override.use_country_default_tax && (
                            <span style={{ color: '#10b981', marginLeft: '8px' }}>
                              ✓ Override: {override.tax_rate_override}%
                            </span>
                          )}
                          {override && override.use_country_default_tax && (
                            <span style={{ color: '#64748b', marginLeft: '8px' }}>
                              (Using country default)
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <select
                          value={currentTaxRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            console.log(`[Regional Tax Modal] Changed ${country.country_code} (${normalizedCode}) to:`, value);
                            if (value === '' || value === 'null') {
                              // Clear the override
                              handleSaveRegionalTax(country.country_code, null);
                            } else {
                              handleSaveRegionalTax(country.country_code, parseFloat(value));
                            }
                          }}
                          style={{
                            padding: '4px 5px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '7px',
                            minWidth: '220px'
                          }}
                        >
                          <option value="">Use Product Default</option>
                          {templates.map(template => (
                            <option key={template.id} value={template.tax_rate}>
                              {template.display_name} ({template.tax_rate}%)
                            </option>
                          ))}
                          {/* If override exists but doesn't match any template, show custom option */}
                          {override && override.tax_rate_override !== null && override.tax_rate_override !== undefined && 
                           !templates.find(t => parseFloat(t.tax_rate) === parseFloat(override.tax_rate_override)) && (
                            <option value={override.tax_rate_override}>
                              Custom: {override.tax_rate_override}%
                            </option>
                          )}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '13px 16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              background: 'white'
            }}>
              <button
                onClick={() => {
                  setShowRegionalTaxModal(null);
                  fetchProducts(); // Refresh products to show updated tax rates
                }}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;