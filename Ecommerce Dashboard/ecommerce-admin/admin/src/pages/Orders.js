import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiMoreHorizontal,
  FiChevronDown,
  FiSearch,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { generateOrderInvoicePDF } from '../utils/pdfGenerator';
import apiClient from '../services/apiClient';
import SearchBar from '../components/SearchBar';

const Orders = () => {
  const { formatAmount: globalFormatAmount, currencySymbol: globalCurrencySymbol, selectedCurrency: globalCurrency } = useGlobalCurrency();
  
  // Local currency conversion function for Orders page
  const formatAmountLocal = (amount, fromCurrency = 'INR') => {
    if (!amount) return `${getLocalCurrencySymbol()}0.00`;
    
    // Use local selectedCurrency if set, otherwise use global currency
    const targetCurrency = selectedCurrency || globalCurrency || 'INR';
    
    console.log('[Orders] formatAmountLocal - selectedCurrency:', selectedCurrency, 'globalCurrency:', globalCurrency, 'targetCurrency:', targetCurrency);
    
    // Get exchange rate for target currency (LIVE from database)
    const currency = currencies.find(c => c.currency_code === targetCurrency);
    const rate = currency ? parseFloat(currency.exchange_rate) : 1;
    
    console.log('[Orders] Currency:', currency?.currency_code, 'Rate:', rate, 'Symbol:', currency?.currency_symbol);
    
    // Convert amount from INR to target currency
    const converted = parseFloat(amount) * rate;
    return `${getLocalCurrencySymbol()}${converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const getLocalCurrencySymbol = () => {
    // Use local selectedCurrency if set, otherwise use global currency
    const targetCurrency = selectedCurrency || globalCurrency;
    
    if (targetCurrency && currencies.length > 0) {
      const currency = currencies.find(c => c.currency_code === targetCurrency);
      console.log('[Orders] getLocalCurrencySymbol - targetCurrency:', targetCurrency, 'found:', currency?.currency_symbol);
      return currency ? currency.currency_symbol : '₹';
    }
    return '₹'; // Default to INR symbol
  };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search term - updates on Enter key press (SearchBar component handles this)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('IND');
  const [currencies, setCurrencies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(null);
  const [editOrderModal, setEditOrderModal] = useState(null);
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState('');
  
  const actionMenuRefs = useRef({});

  // Update debounced search term when searchTerm changes (SearchBar triggers onChange on Enter)
  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchCurrencies();
    fetchCountries();
  }, []);

  // Define fetchOrders function - memoized to prevent unnecessary re-creations
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clean search term - make it flexible to accept any format
      let cleanSearch = debouncedSearchTerm.trim();
      
      // If user types without hashtags, add them
      if (cleanSearch && !cleanSearch.startsWith('#') && cleanSearch.includes('ORD')) {
        cleanSearch = '##' + cleanSearch;
      }
      // If user types with single #, make it ##
      else if (cleanSearch.startsWith('#') && !cleanSearch.startsWith('##')) {
        cleanSearch = '#' + cleanSearch;
      }
      // If already has ##, use as-is
      
      console.log('[Orders] Search input:', debouncedSearchTerm, '→ Clean:', cleanSearch);
      
      const params = {
        page: currentPage,
        per_page: recordsPerPage,
        status: statusFilter,
        payment_status: paymentStatusFilter,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      // Only add search param if search term is not empty
      if (cleanSearch && cleanSearch.trim() !== '') {
        params.search = cleanSearch;
      }
      
      if (selectedCurrency) {
        params.currency = selectedCurrency;
      }
      
      const response = await apiClient.get('/orders/', { params });

      console.log('Orders API response:', response.data);

      setOrders(response.data.orders || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load orders');
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, recordsPerPage, debouncedSearchTerm, statusFilter, paymentStatusFilter, sortBy, sortOrder, selectedCurrency]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, recordsPerPage, debouncedSearchTerm, statusFilter, paymentStatusFilter, sortBy, sortOrder, selectedCurrency]);

  // Close action menu when clicking outside
  useEffect(() => {
    if (!actionMenuOpen) return;
    
    const handleClickOutside = (event) => {
      // Check if click is on any action button - don't close if clicking the button
      const actionButton = event.target.closest('button[title="More Actions"]');
      if (actionButton) {
        return; // Don't close, let the button's onClick handle it
      }
      
      // Check if click is inside any action menu
      const clickedMenu = Object.values(actionMenuRefs.current).find(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!clickedMenu) {
        setActionMenuOpen(null);
      }
    };

    // Delay to avoid immediate closure when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 200);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [actionMenuOpen]);

  const fetchCurrencies = async () => {
    try {
      const response = await apiClient.get('/currencies/');
      setCurrencies(response.data.currencies || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { fetchCountries: fetchCountriesUtil } = await import('../utils/countryCurrencyUtils');
      const uniqueCountries = await fetchCountriesUtil(false); // exclude inactive
      setCountries(uniqueCountries);
      console.log(`[Orders] Loaded ${uniqueCountries.length} unique countries`);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleCountryChange = (countryCode) => {
    console.log('[Orders] Country changed to:', countryCode);
    setSelectedCountry(countryCode);
    
    // Auto-select the country's currency
    const country = countries.find(c => c.country_code === countryCode);
    console.log('[Orders] Found country:', country);
    if (country && country.currency_code) {
      console.log('[Orders] Setting currency to:', country.currency_code);
      setSelectedCurrency(country.currency_code);
    }
  };

  const handleCurrencyChange = (currencyCode) => {
    console.log('[Orders] Currency changed to:', currencyCode);
    setSelectedCurrency(currencyCode);
    
    // Auto-select a country that uses this currency (if available)
    const country = countries.find(c => c.currency_code === currencyCode);
    if (country) {
      setSelectedCountry(country.country_code);
    }
  };

  // Reset selection when orders change
  useEffect(() => {
    setSelectedOrders([]);
    setSelectAll(false);
  }, [orders]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen && !event.target.closest('td[style*="position: relative"]')) {
        setActionMenuOpen(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [actionMenuOpen]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      const newSelection = prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
      setSelectAll(false);
    } else {
      const allOrderIds = orders.map(order => order.id);
      setSelectedOrders(allOrderIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedOrders.length} order(s)?`)) {
      return;
    }

    try {
      const response = await apiClient.delete('/orders/bulk', {
        data: { order_ids: selectedOrders }
      });

      toast.success(response.data.message);
      setSelectedOrders([]);
      setSelectAll(false);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast.error('Failed to delete orders');
    }
  };

  // Handle View Order Details
  const handleViewOrder = async (order) => {
    try {
      const response = await apiClient.get(`/orders/${order.id}`);
      if (response.data && response.data.order) {
        setViewOrderModal(response.data.order);
        setActionMenuOpen(null);
      } else {
        // Fallback: use the order data we already have
        setViewOrderModal(order);
        setActionMenuOpen(null);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response?.data);
      // Fallback: use the order data we already have
      setViewOrderModal(order);
      setActionMenuOpen(null);
      toast.error(error.response?.data?.error || 'Failed to load order details. Using cached data.');
    }
  };

  // Handle Edit Order
  const handleEditOrder = (order) => {
    setEditOrderModal(order);
    setEditPaymentStatus(order.payment_status);
    setEditOrderStatus(order.status);
    setActionMenuOpen(null);
  };

  // Save Order Changes
  const handleSaveOrderChanges = async () => {
    try {
      await apiClient.put(
        `/orders/${editOrderModal.id}/status`,
        {
          payment_status: editPaymentStatus,
          status: editOrderStatus
        }
      );

      toast.success('Order updated successfully!');
      setEditOrderModal(null);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.error || 'Failed to update order');
    }
  };

  // Handle Download Invoice (PDF format)
  const handleDownloadInvoice = async (order) => {
    try {
      // Fetch full order details with items if not already present
      let fullOrder = order;
      if (!order.items || order.items.length === 0) {
        const response = await apiClient.get(`/orders/${order.id}`);
        fullOrder = response.data.order || order;
      }

      // Generate PDF invoice
      generateOrderInvoicePDF(fullOrder);
      
      toast.success(`✓ PDF Invoice downloaded for ${order.order_number}`);
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate PDF invoice');
    }
  };

  const handleExportSelected = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to export');
      return;
    }

    try {
      // Get selected orders data
      const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
      
      // Create CSV content with proper formatting
      const csvHeaders = ['Order Number', 'Customer', 'Date', 'Subtotal', 'Discount', 'Tax', 'Total Amount', 'Currency', 'Payment Status', 'Status'];
      const csvRows = selectedOrdersData.map(order => {
        // Format date as text (DD-MMM-YYYY) to avoid ###### in Excel
        const date = new Date(order.created_at);
        const formattedDate = date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric'
        });
        
        // Get the currency to use
        const targetCurrency = selectedCurrency || globalCurrency;
        const targetCurrencyData = currencies.find(c => c.currency_code === targetCurrency);
        const rate = targetCurrencyData ? parseFloat(targetCurrencyData.exchange_rate) : 1;
        
        // Convert amounts
        const subtotal = (parseFloat(order.subtotal || order.total_amount) * rate).toFixed(2);
        const discount = (parseFloat(order.coupon_discount || 0) * rate).toFixed(2);
        const tax = (parseFloat(order.tax_amount || 0) * rate).toFixed(2);
        const total = (parseFloat(order.total_amount) * rate).toFixed(2);
        
        return [
          order.order_number,
          order.user?.full_name || 'Unknown',
          formattedDate,
          subtotal,
          discount,
          tax,
          total,
          targetCurrency,
          order.payment_status,
          order.status
        ];
      });

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${selectedOrders.length} order(s) exported successfully`);
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-processing',
      processing: 'status-processing',
      shipped: 'status-processing',
      delivered: 'status-active',
      cancelled: 'status-inactive',
      refunded: 'status-inactive'
    };
    const badgeStyle = { fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', lineHeight: '1.2' };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`} style={badgeStyle}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      paid: 'status-active',
      failed: 'status-inactive',
      refunded: 'status-inactive'
    };
    const badgeStyle = { fontSize: '8px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-block', lineHeight: '1.2' };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`} style={badgeStyle}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '268px' }}>
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '2px', lineHeight: '1.3' }}>Orders</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0, lineHeight: '1.4' }}>Track customer purchases and fulfillment status</p>
      </div>
        
        {/* Filters next to title */}
        <div className="page-header-actions" style={{ 
          display: 'flex', 
          flexWrap: 'nowrap',
          alignItems: 'center', 
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Currency Filter */}
            {currencies.length > 0 && (
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
              <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Currency</label>
              <select 
                className="form-select" 
                style={{ 
                  fontSize: '8px',
                  minWidth: '130px',
                  padding: '0 18px 0 4px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontWeight: '500',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                title="Display Currency"
              >
                <option value="">Original Currency</option>
                {currencies.map(curr => (
                  <option key={curr.currency_code} value={curr.currency_code}>
                    {curr.currency_code} ({curr.currency_symbol})
                  </option>
                ))}
              </select>
            </div>
            )}
          
          {/* Sort Filter */}
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
            <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569', letterSpacing: '-0.01em' }}>Sort By</label>
            <select 
              className="form-select" 
              style={{ 
                fontSize: '8px',
                minWidth: '120px',
                padding: '0 18px 0 4px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontWeight: '500',
                color: '#1e293b',
                cursor: 'pointer'
              }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              title="Sort orders by"
            >
              <option value="created_at">Newest First</option>
              <option value="order_number">Order Number</option>
              <option value="total_amount">Total Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
          </div>
        </div>

      <div style={{ marginBottom: '12px' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => {
            const value = e.target?.value || '';
            setSearchTerm(value);
          }}
          placeholder="Search orders by number, customer, or status..."
          onClear={() => {
            setSearchTerm('');
            setDebouncedSearchTerm('');
          }}
          inputProps={{
            autoComplete: 'off',
            maxLength: 200
          }}
          isLoading={loading}
        />
      </div>

      {/* Orders Table */}
      <div className="card table-container" style={{ 
        position: 'relative', 
        zIndex: 1, 
        overflow: 'visible',
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', overflow: 'visible' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    style={{ width: '12px', height: '12px', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>ORDER NO</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>CUSTOMER</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>DATE</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>SUBTOTAL</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>DISCOUNT</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>TAX</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>TOTAL</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>PAYMENT</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'left', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>STATUS</th>
                <th style={{ padding: '3px 5px', fontSize: '9px', fontWeight: '600', textAlign: 'right', letterSpacing: '-0.01em', whiteSpace: 'nowrap', lineHeight: '1.2' }}>ACTIONS</th>
              </tr>
            </thead>
          <tbody>
            {orders.map((order) => {
              // RECALCULATE amounts to match product page (same logic as Invoices page)
              const orderItems = order.items || order.order_items || [];
              
              // RECALCULATE subtotal from order items (sum of base prices: unit_price * quantity)
              let calculatedSubtotal = orderItems.length > 0 ? 
                orderItems.reduce((sum, item) => {
                  const unitPrice = Number(item.unit_price || item.price || 0);
                  const quantity = Number(item.quantity) || 1;
                  return sum + (unitPrice * quantity);
                }, 0) : Number(order.subtotal ?? 0);
              
              // Calculate discounts
              const couponDiscount = Number(order.coupon_discount ?? 0);
              const discountAmount = Number(order.discount_amount ?? 0);
              const walletUsed = Number(order.wallet_used ?? 0);
              const rewardPoints = Number(order.reward_points_used ?? 0);
              const rewardAmount = Number(order.reward_amount ?? order.reward_points_amount ?? 0);
              const calculatedDiscount = couponDiscount + discountAmount + walletUsed + rewardAmount;
              
              // Calculate subtotal after coupon discount (Shopify standard: tax is calculated on this)
              const subtotalAfterCoupon = calculatedSubtotal - couponDiscount;
              
              // Use stored tax_amount from order (calculated correctly during order creation using country_code)
              // This ensures consistency - tax was calculated using country-specific rate during order creation
              // The tax_amount in the order was calculated by recalculate_order_tax_shopify_compliant() which uses
              // the country's default_tax_rate from the countries table based on country_code
              // Tax is calculated on (subtotal - coupon_discount) according to Shopify's standard
              const calculatedTax = Number(order.tax_amount ?? 0);
              console.log(`[Orders Table] Order ${order.order_number}: Using stored tax_amount = ${calculatedTax} (from DB: ${order.tax_amount})`);
              
              // Get shipping cost from order (may be 0 if not implemented)
              const shippingCost = Number(order.shipping_cost ?? 0);
              
              // Use stored total_amount from database (calculated correctly during order creation)
              // This ensures consistency - the total was calculated using the correct formula:
              // total = (subtotal - coupon_discount) + tax + shipping - other_discounts - rewards
              // The backend uses recalculate_order_tax_shopify_compliant() which follows:
              // Base → Coupon → Tax → Shipping → Rewards → Payable
              // Only recalculate if stored total_amount is missing
              const calculatedTotal = Number(order.total_amount ?? (subtotalAfterCoupon + calculatedTax + shippingCost - discountAmount - walletUsed - rewardAmount));
              console.log(`[Orders Table] Order ${order.order_number}: Using stored total_amount = ${calculatedTotal} (from DB: ${order.total_amount}), shipping = ${shippingCost}`);
              
              return (
              <tr 
                key={order.id} 
                style={{ 
                  position: 'relative', 
                  pointerEvents: 'auto',
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
                <td style={{ padding: '3px 5px', fontSize: '8px', lineHeight: '1.2' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    style={{ width: '11px', height: '11px', cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', fontWeight: '600', color: '#f97316', lineHeight: '1.2' }}>
                  {order.order_number}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
                  {order.user?.full_name || 'Unknown Customer'}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', color: '#64748b', lineHeight: '1.2' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric'
                })}</td>
                <td style={{ padding: '3px 5px', fontSize: '8px', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
                  {formatAmountLocal(calculatedSubtotal, order.currency || 'INR')}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', color: '#ef4444', fontWeight: '500', lineHeight: '1.2' }}>
                  {calculatedDiscount > 0 ? `-${formatAmountLocal(calculatedDiscount, order.currency || 'INR')}` : formatAmountLocal(0, order.currency || 'INR')}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', fontWeight: '500', color: '#1e293b', lineHeight: '1.2' }}>
                  {formatAmountLocal(calculatedTax, order.currency || 'INR')}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
                  {formatAmountLocal(calculatedTotal, order.currency || 'INR')}
                </td>
                <td style={{ padding: '3px 5px', fontSize: '8px', lineHeight: '1.2' }}>{getPaymentStatusBadge(order.payment_status)}</td>
                <td style={{ padding: '3px 5px', fontSize: '8px', lineHeight: '1.2' }}>{getStatusBadge(order.status)}</td>
                <td style={{ padding: '3px 5px', position: 'relative', zIndex: 1000, textAlign: 'right' }}>
                  <button 
                    className="btn btn-secondary"
                    data-order-id={order.id}
                    style={{ 
                      padding: '2px 4px',
                      fontSize: '8px', 
                      pointerEvents: 'auto', 
                      zIndex: 10000,
                      position: 'relative',
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '22px',
                      minHeight: '18px'
                    }}
                    title="More Actions"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newState = actionMenuOpen === order.id ? null : order.id;
                      setActionMenuOpen(newState);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    type="button"
                    tabIndex={0}
                  >
                    <FiMoreHorizontal />
                  </button>
                  
                  {/* Action Menu Dropdown - Using Portal */}
                  {actionMenuOpen === order.id && createPortal(
                    <div 
                      ref={(el) => {
                        if (el) {
                          // Force all styles using cssText
                          el.style.cssText = `
                            position: fixed !important;
                            z-index: 999999 !important;
                            display: block !important;
                            visibility: visible !important;
                            opacity: 1 !important;
                            background: #ffffff !important;
                            border: 1px solid #e2e8f0 !important;
                            border-radius: 8px !important;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                            min-width: 180px !important;
                            width: 180px !important;
                            padding: 8px 0 !important;
                            pointer-events: auto !important;
                            max-height: 300px !important;
                            overflow-y: auto !important;
                          `;
                          
                          // Find button and position menu
                          
                          // Find button using data-order-id
                          const button = document.querySelector(`button[data-order-id="${order.id}"]`);
                          const menuWidth = 180;
                          const menuHeight = 200;
                          const viewportWidth = window.innerWidth;
                          const viewportHeight = window.innerHeight;
                          
                          let top, left;
                          
                          if (button) {
                            const buttonRect = button.getBoundingClientRect();
                            
                            // Check if button is off-screen
                            const buttonOffScreen = buttonRect.left > viewportWidth || 
                                                    buttonRect.right < 0 || 
                                                    buttonRect.top > viewportHeight || 
                                                    buttonRect.bottom < 0 ||
                                                    buttonRect.left < -100;
                            
                            if (buttonOffScreen) {
                              // Button is off-screen, center menu in viewport
                              top = Math.max(50, viewportHeight / 2 - menuHeight / 2);
                              left = Math.max(50, viewportWidth / 2 - menuWidth / 2);
                            } else {
                              // Button is visible, position menu relative to it
                              top = buttonRect.bottom + 4;
                              left = buttonRect.right - menuWidth;
                              
                              // Adjust if would go off right edge
                              if (left < 0 || left + menuWidth > viewportWidth) {
                                left = buttonRect.left;
                                if (left + menuWidth > viewportWidth) {
                                  left = viewportWidth - menuWidth - 10;
                                }
                                if (left < 0) {
                                  left = 10;
                                }
                              }
                              
                              // Adjust if would go off bottom, show above button
                              if (top + menuHeight > viewportHeight) {
                                top = buttonRect.top - menuHeight - 4;
                                if (top < 0) {
                                  top = 10;
                                }
                              }
                              
                              // Final clamp to viewport
                              top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));
                              left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));
                            }
                          } else {
                            // Button not found, center menu
                            top = Math.max(50, viewportHeight / 2 - menuHeight / 2);
                            left = Math.max(50, viewportWidth / 2 - menuWidth / 2);
                          }
                          
                          // Ensure menu is within viewport bounds (AGGRESSIVE CLAMPING)
                          top = Math.max(10, Math.min(top, viewportHeight - menuHeight - 10));
                          left = Math.max(10, Math.min(left, viewportWidth - menuWidth - 10));
                          
                          // Force position using cssText to override everything
                          el.style.cssText += `
                            top: ${top}px !important;
                            left: ${left}px !important;
                            transform: none !important;
                          `;
                          
                          // Double-check: if position is still wrong, force center
                          setTimeout(() => {
                            const actualRect = el.getBoundingClientRect();
                            if (actualRect.top > viewportHeight || actualRect.left > viewportWidth || 
                                actualRect.top < 0 || actualRect.left < 0) {
                              // Force center if still off-screen
                              const centerTop = Math.max(50, viewportHeight / 2 - menuHeight / 2);
                              const centerLeft = Math.max(50, viewportWidth / 2 - menuWidth / 2);
                              el.style.cssText += `
                                top: ${centerTop}px !important;
                                left: ${centerLeft}px !important;
                                transform: none !important;
                              `;
                            }
                          }, 0);
                          
                          // Menu positioned successfully
                          actionMenuRefs.current[order.id] = el;
                        } else {
                          delete actionMenuRefs.current[order.id];
                        }
                      }}
                      className="action-menu"
                      style={{
                        position: 'fixed',
                        zIndex: 999999,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '5px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '121px',
                        pointerEvents: 'auto',
                        padding: '4px 0'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        style={{
                          width: '100%',
                          padding: '5px 9px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: '#1e293b',
                          transition: 'background 0.2s',
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewOrder(order);
                        }}
                      >
                        <FiEye /> View Details
                      </button>
                      
                      <button
                        style={{
                          width: '100%',
                          padding: '5px 9px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: '#1e293b',
                          transition: 'background 0.2s',
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                      >
                        <FiEdit /> Edit Order
                      </button>
                      
                      <button
                        style={{
                          width: '100%',
                          padding: '5px 9px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: '#1e293b',
                          transition: 'background 0.2s',
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDownloadInvoice(order);
                        }}
                      >
                        <FiDownload /> Download Invoice
                      </button>
                      
                      <button
                        style={{
                          width: '100%',
                          padding: '5px 9px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '10px',
                          color: '#ef4444',
                          borderTop: '1px solid #f1f5f9',
                          transition: 'background 0.2s',
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm(`Delete order ${order.order_number}?`)) {
                            handleSelectOrder(order.id);
                            handleBulkDelete();
                          }
                          setActionMenuOpen(null);
                        }}
                      >
                        <FiTrash2 /> Delete Order
                      </button>
                    </div>,
                    document.body
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>

      {/* Selection Info and Action Buttons */}
      {selectedOrders.length > 0 && (
        <div style={{ 
          marginTop: '10px', 
          padding: '6px 10px', 
          background: '#f8fafc', 
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: '500' }}>
            {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}

      {/* Action Buttons and Pagination */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '14px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <button 
            className="btn btn-danger"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Delete button clicked');
              handleBulkDelete();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={selectedOrders.length === 0}
            style={{ 
              opacity: selectedOrders.length === 0 ? 0.5 : 1,
              cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 10
            }}
          >
            <FiTrash2 />
            Delete
          </button>
          {/* Records Per Page Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '7px' }}>
            <label style={{ fontSize: '9px', color: '#64748b', whiteSpace: 'nowrap' }}>
              Show:
            </label>
            <select 
              className="form-select" 
              style={{ width: '54px', padding: '4px 5px' }}
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // Reset to page 1 when changing records per page
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: '9px', color: '#64748b', whiteSpace: 'nowrap' }}>
              per page
            </span>
          </div>
        </div>

        {/* Export and Pagination */}
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={handleExportSelected}
            disabled={selectedOrders.length === 0}
            style={{ 
              opacity: selectedOrders.length === 0 ? 0.5 : 1,
              cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer',
              pointerEvents: 'auto'
            }}
          >
            <FiDownload />
            Export CSV
          </button>
          
          <div style={{ display: 'flex', gap: '3px' }}>
            <button 
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={{ pointerEvents: 'auto' }}
            >
              «
            </button>
            
            <button className="btn btn-primary" style={{ pointerEvents: 'auto' }}>
              {currentPage}
            </button>
            
            <button 
              className="btn btn-secondary"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{ pointerEvents: 'auto' }}
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '536px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Order Details</h2>
              <button onClick={() => setViewOrderModal(null)} style={{ fontSize: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>
            
            {/* Order Info */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '11px', 
                  marginBottom: '11px',
              padding: '11px',
              background: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Order Number</strong>
                <span style={{ fontSize: '9px', fontWeight: '500' }}>{viewOrderModal.order_number}</span>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Customer</strong>
                <span style={{ fontSize: '9px' }}>{viewOrderModal.user?.full_name || 'Unknown'}</span>
                {viewOrderModal.user?.email && (
                  <div style={{ fontSize: '8px', color: '#64748b' }}>{viewOrderModal.user.email}</div>
                )}
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Date</strong>
                <span style={{ fontSize: '9px' }}>{new Date(viewOrderModal.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Payment Method</strong>
                <span style={{ fontSize: '9px' }}>
                  {viewOrderModal.payment_method && viewOrderModal.payment_method.trim() 
                    ? viewOrderModal.payment_method 
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Shipping Method</strong>
                <span style={{ fontSize: '9px' }}>
                  {viewOrderModal.shipping_method && viewOrderModal.shipping_method.trim()
                    ? viewOrderModal.shipping_method
                    : (viewOrderModal.shipping_cost && parseFloat(viewOrderModal.shipping_cost) > 0
                        ? 'Standard Shipping'
                        : 'Not specified')}
                </span>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Payment Status</strong>
                <div style={{ marginTop: '3px' }}>{getPaymentStatusBadge(viewOrderModal.payment_status)}</div>
              </div>
              <div>
                <strong style={{ color: '#64748b', fontSize: '8px', display: 'block' }}>Order Status</strong>
                <div style={{ marginTop: '3px' }}>{getStatusBadge(viewOrderModal.status)}</div>
              </div>
            </div>

            {/* Order Items */}
            {viewOrderModal.items && viewOrderModal.items.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '11px', marginBottom: '8px' }}>Order Items</h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '8px', fontWeight: '600', color: '#64748b' }}>Product</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '8px', fontWeight: '600', color: '#64748b' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '8px', fontWeight: '600', color: '#64748b' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '8px', fontWeight: '600', color: '#64748b' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOrderModal.items.map((item, idx) => {
                        // Calculate unit price - use stored value or calculate from total/quantity
                        const unitPrice = item.unit_price && parseFloat(item.unit_price) > 0
                          ? parseFloat(item.unit_price)
                          : (item.total_price && item.quantity
                              ? parseFloat(item.total_price) / (parseInt(item.quantity) || 1)
                              : 0);
                        
                        // Calculate total price - use stored value or calculate from unit*quantity
                        const totalPrice = item.total_price && parseFloat(item.total_price) > 0
                          ? parseFloat(item.total_price)
                          : (item.unit_price && item.quantity
                              ? parseFloat(item.unit_price) * (parseInt(item.quantity) || 1)
                              : 0);
                        
                        return (
                          <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px', fontSize: '9px' }}>
                              {item.product_name || item.product?.name || 'Unknown Product'}
                              {item.product?.sku && (
                                <div style={{ fontSize: '8px', color: '#64748b' }}>SKU: {item.product.sku}</div>
                              )}
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center', fontSize: '9px' }}>{item.quantity || 0}</td>
                            <td style={{ padding: '8px', textAlign: 'right', fontSize: '9px' }}>
                              {formatAmountLocal(unitPrice, item.currency || viewOrderModal.currency || 'INR')}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>
                              {formatAmountLocal(totalPrice, item.currency || viewOrderModal.currency || 'INR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Order Summary */}
            {(() => {
              // Calculate subtotal from order items (sum of all item.total_price)
              // IMPORTANT: Always recalculate from items, don't trust stored database values
              let calculatedSubtotal = 0;
              
              if (viewOrderModal.items && viewOrderModal.items.length > 0) {
                calculatedSubtotal = viewOrderModal.items.reduce((sum, item) => {
                  // Priority: Use total_price if it exists and is valid
                  // Otherwise calculate from unit_price * quantity
                  let itemTotal = 0;
                  
                  if (item.total_price && !isNaN(parseFloat(item.total_price))) {
                    itemTotal = parseFloat(item.total_price);
                  } else if (item.unit_price && item.quantity) {
                    // Calculate: unit_price * quantity
                    const unitPrice = parseFloat(item.unit_price || 0);
                    const quantity = parseInt(item.quantity || 1);
                    itemTotal = unitPrice * quantity;
                  }
                  
                  console.log(`[Order Details] Item: ${item.product_name}, unit_price: ${item.unit_price}, quantity: ${item.quantity}, total_price: ${item.total_price}, calculated: ${itemTotal}`);
                  
                  return sum + itemTotal;
                }, 0);
                
                console.log(`[Order Details] Calculated Subtotal from items: ${calculatedSubtotal}`);
              } else {
                // Fallback to stored value only if no items
                calculatedSubtotal = parseFloat(viewOrderModal.subtotal || 0);
                console.warn(`[Order Details] No items found, using stored subtotal: ${calculatedSubtotal}`);
              }

              // Get discount amounts (use raw numeric values, not formatted)
              const couponDiscount = parseFloat(viewOrderModal.coupon_discount || 0);
              const discountAmount = parseFloat(viewOrderModal.discount_amount || 0);
              
              // Calculate group discount from items
              const groupDiscount = viewOrderModal.items && viewOrderModal.items.length > 0
                ? viewOrderModal.items.reduce((sum, item) => {
                    const itemGroupDiscount = parseFloat(item.group_discount || 0);
                    return sum + (isNaN(itemGroupDiscount) ? 0 : itemGroupDiscount);
                  }, 0)
                : 0;
              
              // Also check for item-level discounts
              const itemDiscounts = viewOrderModal.items && viewOrderModal.items.length > 0
                ? viewOrderModal.items.reduce((sum, item) => {
                    const itemDiscount = parseFloat(item.discount_amount || 0);
                    return sum + (isNaN(itemDiscount) ? 0 : itemDiscount);
                  }, 0)
                : 0;
              
              const totalDiscount = couponDiscount + discountAmount + groupDiscount + itemDiscounts;

              // Get other amounts (use raw numeric values)
              const shippingCost = parseFloat(viewOrderModal.shipping_cost || 0) || 0;
              
              // Recalculate tax using the same method as backend: (subtotal - coupon_discount) * tax_rate
              // This ensures consistency with how tax was calculated during order creation
              let taxAmount = parseFloat(viewOrderModal.tax_amount || 0) || 0;
              
              // If we have country_code, we could fetch tax rate, but for now use stored tax_amount
              // The stored tax_amount should be correct as it was calculated during order creation
              // using calculate_shopify_compliant_pricing() which uses country.default_tax_rate
              // However, if stored value seems wrong, we'll trust the backend calculation
              // The tax_amount in the order was calculated as: (subtotal - coupon_discount) * (tax_rate / 100)
              
              // For display consistency, use the stored tax_amount from database
              // This was calculated correctly during order creation using country-specific tax rate
              taxAmount = parseFloat(viewOrderModal.tax_amount || 0) || 0;
              console.log(`[Order Details Modal] Order ${viewOrderModal.order_number}: Using stored tax_amount = ${taxAmount} (from DB: ${viewOrderModal.tax_amount})`);

              // Use stored total_amount from database (calculated correctly during order creation)
              // This ensures consistency - the total was calculated using the correct formula:
              // total = (subtotal - coupon_discount) + tax + shipping - other_discounts
              // The backend uses calculate_shopify_compliant_pricing() which follows:
              // Base → Coupon → Tax → Shipping → Rewards → Payable
              const calculatedTotal = Number(viewOrderModal.total_amount ?? (calculatedSubtotal - totalDiscount + taxAmount + shippingCost));
              console.log(`[Order Details Modal] Order ${viewOrderModal.order_number}: Using stored total_amount = ${calculatedTotal} (from DB: ${viewOrderModal.total_amount})`);
              
              // Debug logging to help identify issues
              console.log(`[Order Details] Calculation breakdown for Order ${viewOrderModal.order_number}:
                Items count: ${viewOrderModal.items?.length || 0}
                Calculated Subtotal (from items): ${calculatedSubtotal}
                Coupon Discount: ${couponDiscount}
                Discount Amount: ${discountAmount}
                Group Discount: ${groupDiscount}
                Item Discounts: ${itemDiscounts}
                Total Discount: ${totalDiscount}
                Tax: ${taxAmount}
                Shipping: ${shippingCost}
                Calculated Total: ${calculatedTotal}
                Stored Total (from DB): ${viewOrderModal.total_amount}
                Order Currency: ${viewOrderModal.currency || 'INR'}`);

              return (
                <div style={{ 
                  padding: '11px', 
                  background: '#f8fafc', 
                  borderRadius: '8px',
                  marginBottom: '11px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>Subtotal:</span>
                    <span>{formatAmountLocal(calculatedSubtotal, viewOrderModal.currency)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <>
                      {couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#ef4444' }}>
                          <span style={{ paddingLeft: '12px' }}>Coupon Discount:</span>
                          <span>-{formatAmountLocal(couponDiscount, viewOrderModal.currency)}</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#ef4444' }}>
                          <span style={{ paddingLeft: '12px' }}>Discount:</span>
                          <span>-{formatAmountLocal(discountAmount, viewOrderModal.currency)}</span>
                        </div>
                      )}
                      {groupDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px', color: '#ef4444' }}>
                          <span style={{ paddingLeft: '12px' }}>Group Discount:</span>
                          <span>-{formatAmountLocal(groupDiscount, viewOrderModal.currency)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>
                        <span>Total Discount:</span>
                        <span>-{formatAmountLocal(totalDiscount, viewOrderModal.currency)}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span>Shipping:</span>
                    <span>
                      {shippingCost > 0 
                        ? formatAmountLocal(shippingCost, viewOrderModal.currency)
                        : formatAmountLocal(0, viewOrderModal.currency)}
                    </span>
                  </div>
                  {taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                      <span>Tax:</span>
                      <span>{formatAmountLocal(taxAmount, viewOrderModal.currency)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid #cbd5e1', fontSize: '16px', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span>{formatAmountLocal(calculatedTotal, viewOrderModal.currency)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Addresses */}
            {(viewOrderModal.shipping_address || viewOrderModal.billing_address) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {viewOrderModal.shipping_address && (
                  <div>
                    <h4 style={{ fontSize: '9px', fontWeight: '600', marginBottom: '5px' }}>Shipping Address</h4>
                    <div style={{ fontSize: '9px', color: '#64748b', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {viewOrderModal.shipping_address}
                    </div>
                  </div>
                )}
                {viewOrderModal.billing_address && (
                  <div>
                    <h4 style={{ fontSize: '9px', fontWeight: '600', marginBottom: '5px' }}>Billing Address</h4>
                    <div style={{ fontSize: '9px', color: '#64748b', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {viewOrderModal.billing_address}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {viewOrderModal.notes && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Notes</h4>
                <div style={{ fontSize: '9px', color: '#64748b', padding: '8px', background: '#fef3c7', borderRadius: '4px' }}>
                  {viewOrderModal.notes}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setViewOrderModal(null)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setViewOrderModal(null);
                  handleEditOrder(viewOrderModal);
                }}
              >
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editOrderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Edit Order</h2>
              <button onClick={() => setEditOrderModal(null)} style={{ fontSize: '16px', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Order Number</label>
                <input type="text" value={editOrderModal.order_number} disabled className="form-input" style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Customer</label>
                <input 
                  type="text" 
                  value={editOrderModal.user?.full_name || 'Unknown'} 
                  disabled 
                  className="form-input" 
                  style={{ width: '100%' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Total Amount</label>
                <input 
                  type="text" 
                  value={formatAmountLocal(editOrderModal.total_amount, editOrderModal.currency)} 
                  disabled 
                  className="form-input" 
                  style={{ width: '100%' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Payment Status</label>
                <select 
                  className="form-select" 
                  style={{ width: '100%' }} 
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Order Status</label>
                <select 
                  className="form-select" 
                  style={{ width: '100%' }} 
                  value={editOrderStatus}
                  onChange={(e) => setEditOrderStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditOrderModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveOrderChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export CSV Button - Moved to bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', marginBottom: '14px', position: 'relative', zIndex: 10 }}>
        <button 
          className="btn btn-export-csv" 
          style={{ 
            opacity: selectedOrders.length === 0 ? 0.5 : 1,
            cursor: selectedOrders.length === 0 ? 'not-allowed' : 'pointer',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            fontSize: '11px',
            fontWeight: '600',
            position: 'relative',
            zIndex: 100
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Export CSV button clicked');
            handleExportSelected();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          disabled={selectedOrders.length === 0}
        >
          <FiDownload />
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default Orders;
