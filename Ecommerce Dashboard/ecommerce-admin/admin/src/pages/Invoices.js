import React, { useState, useEffect, useRef } from 'react';
import { 
  FiDownload,
  FiEye,
  FiFilter,
  FiX,
  FiFileText,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { generateOrderInvoicePDF } from '../utils/pdfGenerator';
import apiClient from '../services/apiClient';
import { useTheme } from '../contexts/ThemeContext';

const Invoices = () => {
  const { formatAmount: globalFormatAmount, currencySymbol: globalCurrencySymbol, selectedCurrency: globalCurrency } = useGlobalCurrency();
  const { isDark } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const searchTimeout = useRef(null);

  // Update debounced search immediately when searchTerm changes (on Enter press)
  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, recordsPerPage, debouncedSearchTerm, statusFilter, paymentStatusFilter, selectedCurrency]);

  const fetchCurrencies = async () => {
    try {
      const res = await apiClient.get('/currencies/');
      setCurrencies(res.data.currencies || []);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: recordsPerPage
      };

      // Only add search param if search term is not empty
      if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
        params.search = debouncedSearchTerm.trim();
      }

      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;

      const response = await apiClient.get('/orders/', { params });
      const ordersData = response.data.orders || [];
      
      // Convert orders to invoices format
      setInvoices(ordersData);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    // Only block cancelled and refunded invoices
    if (invoice.status && (invoice.status.toLowerCase() === 'cancelled' || invoice.status.toLowerCase() === 'refunded')) {
      toast.error('Cannot download invoice for cancelled or refunded orders');
      return;
    }
    
    try {
      // Fetch full order data with items
      const orderResponse = await apiClient.get(`/orders/${invoice.id}`);
      const orderData = orderResponse.data.order || orderResponse.data;
      const orderItems = orderData.items || orderData.order_items || [];
        
      // Prepare invoice data - ensure all fields are properly set
      const fullInvoiceData = {
        ...orderData,
        invoice_number: invoice.order_number || orderData.order_number || `INV-${invoice.id}`,
        items: orderItems,
        // Ensure addresses are included
        billing_address: orderData.billing_address || invoice.billing_address,
        shipping_address: orderData.shipping_address || invoice.shipping_address || orderData.billing_address,
        // Ensure user info is included
        user: orderData.user || invoice.user,
        customer_name: orderData.user?.full_name || invoice.user?.full_name,
        customer_email: orderData.user?.email || invoice.user?.email,
        customer_phone: orderData.user?.phone || invoice.user?.phone
      };
      
      // Use stored tax_amount from order (calculated correctly during order creation using country_code)
      // This ensures consistency - tax was calculated using country-specific rate during order creation
      // The tax_amount was calculated by calculate_shopify_compliant_pricing() which uses
      // the country's default_tax_rate from the countries table based on country_code
      const recalcTax = Number(fullInvoiceData.tax_amount ?? invoice.tax_amount ?? 0);
        
      // Recalculate subtotal from order items
      const recalcSubtotal = orderItems.length > 0 ? 
        orderItems.reduce((sum, item) => {
          const unitPrice = Number(item.unit_price || item.price || 0);
          const quantity = Number(item.quantity) || 1;
          return sum + (unitPrice * quantity);
        }, 0) : Number(fullInvoiceData.subtotal ?? invoice.subtotal ?? 0);
        
      // Shipping is NOT implemented - always 0
      const recalcShipping = 0;
        
      fullInvoiceData.subtotal = recalcSubtotal;
      fullInvoiceData.tax_amount = recalcTax;
      fullInvoiceData.shipping_cost = recalcShipping;
      fullInvoiceData.total_amount = recalcSubtotal + recalcTax + recalcShipping 
        - Number(fullInvoiceData.discount_amount ?? 0)
        - Number(fullInvoiceData.coupon_discount ?? 0)
        - Number(fullInvoiceData.wallet_used ?? 0)
        - Number(fullInvoiceData.reward_amount ?? fullInvoiceData.reward_points_amount ?? 0);

      // Generate PDF - generateOrderInvoicePDF only accepts one parameter (order object)
      generateOrderInvoicePDF(fullInvoiceData);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.currency_code === currencyCode);
    return currency?.currency_symbol || '₹';
  };

  const formatAmount = (amount, currency = 'INR') => {
    if (!amount) return `${getCurrencySymbol(currency)}0.00`;
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': '#fbbf24',
      'processing': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'refunded': '#8b5cf6',
      'confirmed': '#6b7280'
    };
    const color = statusColors[status?.toLowerCase()] || '#6b7280';
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '500',
        backgroundColor: `${color}20`,
        color: color
      }}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      'pending': '#fbbf24',
      'paid': '#10b981',
      'failed': '#ef4444',
      'refunded': '#8b5cf6'
    };
    const color = statusColors[status?.toLowerCase()] || '#6b7280';
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '500',
        backgroundColor: `${color}20`,
        color: color
      }}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  // Professional theme-aware styles
  const containerStyle = {
    padding: '21px',
    background: isDark ? '#0f172a' : '#fafbfc',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  };

  const cardStyle = {
    background: isDark ? '#1e293b' : '#ffffff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: isDark 
      ? '0 1px 3px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)' 
      : '0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.06)',
    border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '21px'
  };

  const titleStyle = {
    fontSize: '21px',
    fontWeight: '700',
    margin: 0,
    color: isDark ? '#e2e8f0' : '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const filterCardStyle = {
    ...cardStyle,
    padding: '13px',
    marginBottom: '16px'
  };

  const tableCardStyle = {
    ...cardStyle,
    padding: 0,
    overflow: 'hidden'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'transparent'
  };

  const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: isDark ? '#94a3b8' : '#64748b',
    background: isDark ? '#0f172a' : '#f8fafc',
    borderBottom: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
    whiteSpace: 'nowrap'
  };

  const tdStyle = {
    padding: '12px 16px',
    fontSize: '13px',
    color: isDark ? '#cbd5e1' : '#1e293b',
    borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    transition: 'background-color 0.2s ease'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '54px 13px',
    color: isDark ? '#64748b' : '#6b7280'
  };

  const emptyIconStyle = {
    fontSize: '64px',
    color: isDark ? '#334155' : '#e2e8f0',
    marginBottom: '16px'
  };

  const emptyTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: isDark ? '#94a3b8' : '#475569',
    marginBottom: '8px'
  };

  const emptyTextStyle = {
    fontSize: '14px',
    color: isDark ? '#64748b' : '#94a3b8'
  };

  return (
    <div>
      {/* Header Card */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '20px' }}>
          {/* Title and Subtitle */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '700', 
              color: isDark ? '#e2e8f0' : '#1e293b',
              marginBottom: '6px'
            }}>
              Invoices
            </h2>
            <p style={{ 
              margin: 0, 
              fontSize: '13px', 
              color: isDark ? '#94a3b8' : '#64748b',
              lineHeight: '1.5'
            }}>
              View and manage all invoice records
            </p>
          </div>

          {/* Filter Dropdowns - Horizontal Row */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap', marginBottom: '16px' }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ 
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  cursor: 'pointer',
                  width: '120px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%2394a3b8' : '%2364748b'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF8C00';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="form-select"
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ 
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  cursor: 'pointer',
                  width: '140px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%2394a3b8' : '%2364748b'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF8C00';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                title="Filter by payment status"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                className="form-select"
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ 
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  background: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  cursor: 'pointer',
                  width: '110px',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%2394a3b8' : '%2364748b'}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  paddingRight: '28px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF8C00';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                title="Records per page"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
          </div>

          {/* Search Bar - Full Width */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ 
              position: 'absolute', 
              left: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: isDark ? '#64748b' : '#94a3b8',
              fontSize: '14px',
              width: '14px',
              height: '14px',
              pointerEvents: 'none',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice number, customer... (Press Enter to search)"
              style={{
                width: '100%',
                padding: '8px 14px 8px 34px',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '6px',
                fontSize: '12px',
                background: isDark ? '#0f172a' : '#ffffff',
                color: isDark ? '#e2e8f0' : '#1e293b',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                lineHeight: '1.5',
                height: '36px'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setDebouncedSearchTerm(searchTerm);
                  setCurrentPage(1);
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FF8C00';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {debouncedSearchTerm && (
        <div style={{ 
          marginBottom: '12px', 
          padding: '8px 12px', 
          backgroundColor: isDark ? '#1e293b' : '#f8fafc', 
          borderRadius: '8px',
          fontSize: '12px',
          color: isDark ? '#94a3b8' : '#64748b',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`
        }}>
          Search results for "{debouncedSearchTerm}": {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Invoices Table Card */}
      {loading ? (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '40px 13px', color: isDark ? '#94a3b8' : '#64748b' }}>
            <FiRefreshCw style={{ fontSize: '21px', marginBottom: '11px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '11px', fontWeight: '500' }}>Loading invoices...</div>
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div style={cardStyle}>
          <div style={emptyStateStyle}>
            <FiFileText style={emptyIconStyle} />
            <div style={emptyTitleStyle}>No invoices found</div>
            <div style={emptyTextStyle}>
              {debouncedSearchTerm || statusFilter || paymentStatusFilter 
                ? 'Try adjusting your filters to see more results'
                : 'When orders are placed, invoices will appear here'}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={tableCardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Invoice #</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Date</th>
                    <th style={{...thStyle, textAlign: 'right'}}>Amount</th>
                    <th style={{...thStyle, textAlign: 'center'}}>Status</th>
                    <th style={{...thStyle, textAlign: 'center'}}>Payment</th>
                    <th style={{...thStyle, textAlign: 'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr 
                      key={invoice.id} 
                      style={{
                        ...tdStyle,
                        background: index % 2 === 0 
                          ? (isDark ? '#1e293b' : '#ffffff')
                          : (isDark ? '#0f172a' : '#fafbfc'),
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? '#334155' : '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 
                          ? (isDark ? '#1e293b' : '#ffffff')
                          : (isDark ? '#0f172a' : '#fafbfc');
                      }}
                    >
                      <td style={{...tdStyle, fontWeight: '600', color: '#FF8C00', fontSize: '12px'}}>
                        {invoice.order_number || `INV-${invoice.id}`}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '500', marginBottom: '3px', fontSize: '13px' }}>
                          {invoice.user?.full_name || 'Unknown'}
                        </div>
                        {invoice.user?.email && (
                          <div style={{ fontSize: '11px', color: isDark ? '#64748b' : '#94a3b8' }}>
                            {invoice.user.email}
                          </div>
                        )}
                      </td>
                      <td style={{...tdStyle, fontSize: '12px'}}>
                        {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </td>
                      <td style={{...tdStyle, textAlign: 'right', fontWeight: '600', fontSize: '13px'}}>
                        {formatAmount(invoice.total_amount, invoice.currency)}
                      </td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        {getPaymentStatusBadge(invoice.payment_status)}
                      </td>
                      <td style={{...tdStyle, textAlign: 'center'}}>
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="btn btn-primary"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '6px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          disabled={invoice.status?.toLowerCase() === 'cancelled' || invoice.status?.toLowerCase() === 'refunded'}
                        >
                          <FiDownload style={{ fontSize: '14px' }} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '12px',
            border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
            boxShadow: isDark 
              ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
              : '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px', fontWeight: '500' }}>
              Page {currentPage} of {totalPages} • {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} shown
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                  background: isDark ? '#334155' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#475569',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontWeight: '500'
                }}
              >
                Previous
              </button>
              <button 
                className="btn btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                  background: isDark ? '#334155' : '#ffffff',
                  color: isDark ? '#e2e8f0' : '#475569',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Invoices;

