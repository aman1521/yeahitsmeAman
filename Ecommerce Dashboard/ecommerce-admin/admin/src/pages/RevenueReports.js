import React, { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiFilter,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { generateRevenuePDF } from '../utils/revenuePdfGenerator';

const RevenueReports = () => {
  const { isDark, theme } = useTheme();
  const { selectedCurrency, formatAmount } = useGlobalCurrency();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [rangeMode, setRangeMode] = useState('preset');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [rangeMeta, setRangeMeta] = useState(null);
  const [totalUniqueCustomers, setTotalUniqueCustomers] = useState(0);

  const parseInputDate = (value) => {
    if (!value) return null;
    let candidate = value.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(candidate)) {
      const [day, month, year] = candidate.split('-');
      candidate = `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
      candidate = `${candidate}T00:00:00`;
    }
    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  console.log('[Revenue Reports] Currency:', selectedCurrency);

  useEffect(() => {
    if (rangeMode === 'custom' && (!customRange.start || !customRange.end)) {
      return;
    }
    fetchReportData();
  }, [dateRange, selectedCurrency, rangeMode, customRange.start, customRange.end]);  // Re-fetch when dependencies change!

  useEffect(() => {
    if (rangeMode === 'custom' && rangeMeta?.range) {
      setCustomRange((prev) => ({
        start: prev.start || rangeMeta.range.start_date,
        end: prev.end || rangeMeta.range.end_date
      }));
    }
  }, [rangeMode, rangeMeta]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      if (rangeMode === 'custom') {
        if (!customRange.start || !customRange.end) {
          console.warn('[Revenue Reports] Custom range incomplete, skipping fetch');
          setLoading(false);
          return;
        }
        const startObj = parseInputDate(customRange.start);
        const endObj = parseInputDate(customRange.end);
        if (!startObj || !endObj) {
          toast.error('Invalid date selection. Please pick valid dates.');
          setLoading(false);
          return;
        }
        if (startObj > endObj) {
          toast.error('Start date cannot be after end date');
        setLoading(false);
        return;
      }
      }

      let rangeParams;
      let customStartObj = null;
      let customEndObj = null;
      if (rangeMode === 'custom') {
        customStartObj = parseInputDate(customRange.start);
        customEndObj = parseInputDate(customRange.end);
        const startIso = customStartObj.toISOString().split('T')[0];
        const endIso = customEndObj.toISOString().split('T')[0];
        rangeParams = { start_date: startIso, end_date: endIso };
      } else {
        rangeParams = { days: parseInt(dateRange, 10) };
      }

      // Get REAL data from backend (data is already in base currency INR)
      console.log('[Revenue Reports] Fetching data with params:', rangeParams, 'currency:', selectedCurrency);
      
      const response = await apiClient.get('/dashboard/sales-chart', { params: rangeParams });
      
      if (response.data && response.data.chart_data) {
        setRangeMeta(response.data.meta || null);
        // Store total_unique_customers for PDF generation (users who placed orders)
        const uniqueCustomers = response.data.total_unique_customers || 0;
        setTotalUniqueCustomers(uniqueCustomers);
        
        // Data from backend is in INR, will be displayed in selected currency via formatAmount
        const formattedData = response.data.chart_data.map(item => ({
          date: item.date,
          revenue: item.sales || 0,  // Keep in base currency (INR)
          orders: item.orders || 0,
          customers: item.customers || 0
        }));
        
        // CRITICAL: Sort data by date chronologically to fix display issues
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setReportData(formattedData);
        console.log(`[Revenue Reports] Loaded ${formattedData.length} days of data`);
        if (formattedData.length > 0) {
          console.log(`[Revenue Reports] Date range: ${formattedData[0].date} to ${formattedData[formattedData.length - 1].date}`);
        }
      } else {
        console.warn('[Revenue Reports] No chart data in response');
        setReportData([]);
        setRangeMeta(null);
      }
    } catch (error) {
      console.error('[Revenue Reports] Error fetching data:', error);
      toast.error('Failed to load revenue data');
      setReportData([]);
      setRangeMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      if (!reportData || reportData.length === 0) {
        toast.error('No data available for the selected period. Please ensure you have orders in the database.');
        return;
      }
      
      console.log(`[Revenue Reports] Generating PDF for ${rangeSummary}...`);
      console.log(`[Revenue Reports] Data points: ${reportData.length}`);
      console.log(`[Revenue Reports] Sample data:`, reportData[0]);
      
      // Calculate totals
      const totalRevenue = reportData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
      const totalOrders = reportData.reduce((sum, item) => sum + (parseInt(item.orders) || 0), 0);
      const totalCustomers = reportData.reduce((sum, item) => sum + (parseInt(item.customers) || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      console.log(`[Revenue Reports] Totals - Revenue: ${totalRevenue}, Orders: ${totalOrders}, Customers: ${totalCustomers}`);
      
      const durationDays = rangeMeta?.range?.days ?? (
        rangeMode === 'custom' && customRange.start && customRange.end
          ? (() => {
              const startObj = parseInputDate(customRange.start);
              const endObj = parseInputDate(customRange.end);
              if (!startObj || !endObj) return parseInt(dateRange, 10);
              return Math.max(Math.floor((endObj - startObj) / (1000 * 60 * 60 * 24)) + 1, 1);
            })()
          : parseInt(dateRange, 10)
      );
      // CRITICAL: Pass the reportData array and total unique customers (users who placed orders)
      await generateRevenuePDF(reportData, durationDays, totalUniqueCustomers);
      
      toast.success(`PDF downloaded for ${rangeSummary}!`);
    } catch (error) {
      console.error('[Revenue Reports] PDF generation error:', error);
      toast.error(`Failed to download report: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  const rangeSummary = rangeMeta
    ? `${rangeMeta.range.start_date} → ${rangeMeta.range.end_date}`
    : rangeMode === 'custom'
      ? (customRange.start && customRange.end ? `${customRange.start} → ${customRange.end}` : 'Custom dates')
      : `Last ${dateRange} days`;

  // No need for getCurrencySymbol - formatAmount handles it

  return (
    <div className="page-container revenue-reports-container" style={{ padding: '12px 14px' }}>
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '2px', lineHeight: '1.3' }}>Revenue Reports</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0, lineHeight: '1.4' }}>View and download revenue analysis in {selectedCurrency}</p>
          {rangeMeta && (
            <div style={{ color: isDark ? '#8b949e' : '#94a3b8', fontSize: '9px', marginTop: '4px', lineHeight: '1.3' }}>
              Showing data from {rangeMeta.range.start_date} to {rangeMeta.range.end_date}
            </div>
          )}
        </div>

        <div className="page-header-actions" style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          alignItems: 'center', 
          gap: '8px',
          flexShrink: 0
        }}>
          <div className="filter-chip" style={{ 
            padding: '4px 10px', 
            gap: '6px', 
            borderRadius: '5px', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
            border: '1px solid #e2e8f0',
            minHeight: '24px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569' }}>Range</label>
            <select 
              className="form-select" 
              style={{ fontSize: '8px', padding: '2px 4px', minHeight: '20px', border: 'none', background: 'transparent' }}
              value={rangeMode}
              onChange={(e) => setRangeMode(e.target.value)}
            >
              <option value="preset">Quick</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {rangeMode === 'preset' ? (
            <div className="filter-chip" style={{ 
              padding: '4px 10px', 
              gap: '6px', 
              borderRadius: '5px', 
              display: 'flex', 
              alignItems: 'center', 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
              border: '1px solid #e2e8f0',
              minHeight: '24px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <label style={{ fontSize: '8px', fontWeight: '600', whiteSpace: 'nowrap', color: '#475569' }}>Period</label>
              <select 
                className="form-select" 
                style={{ fontSize: '8px', padding: '2px 4px', minHeight: '20px', border: 'none', background: 'transparent' }}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">7d</option>
                <option value="30">30d</option>
                <option value="60">60d</option>
                <option value="90">90d</option>
                <option value="365">1y</option>
              </select>
            </div>
          ) : (
            <div className="filter-chip" style={{ 
              padding: '4px 10px', 
              gap: '4px', 
              borderRadius: '5px', 
              display: 'flex', 
              alignItems: 'center', 
              background: isDark ? '#161b22' : '#f8fafc',
              border: `1px solid ${isDark ? '#30363d' : '#e2e8f0'}`,
              minHeight: '24px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              <FiCalendar style={{ color: isDark ? '#58a6ff' : '#64748b', fontSize: '8px', flexShrink: 0 }} />
              <input
                type="date"
                className="form-input"
                style={{ 
                  padding: '2px 4px', 
                  border: 'none',
                  background: 'transparent',
                  fontSize: '8px',
                  width: '90px',
                  color: isDark ? '#e6edf3' : '#1e293b',
                  cursor: 'pointer',
                  minHeight: '20px'
                }}
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
              />
              <span style={{ color: isDark ? '#8b949e' : '#94a3b8', fontSize: '8px', flexShrink: 0 }}>→</span>
              <input
                type="date"
                className="form-input"
                style={{ 
                  padding: '2px 4px', 
                  border: 'none',
                  background: 'transparent',
                  fontSize: '8px',
                  width: '90px',
                  color: isDark ? '#e6edf3' : '#1e293b',
                  cursor: 'pointer',
                  minHeight: '20px'
                }}
                value={customRange.end}
                min={customRange.start || undefined}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          )}

          <button 
            className="btn btn-secondary"
            onClick={fetchReportData}
            disabled={loading}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '8px', 
              padding: '4px 8px', 
              minHeight: '24px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <FiRefreshCw style={{ fontSize: '10px' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Report Summary Section */}
      {reportData.length > 0 ? (
        <div className="card" style={{ marginTop: '10px' }}>
          <div className="card-header" style={{ padding: '10px 12px' }}>
            <h3 className="card-title" style={{ color: isDark ? '#e4e6eb' : '#1e293b', fontSize: '12px' }}>Revenue Summary ({rangeSummary})</h3>
          </div>
          <div style={{ padding: '10px 12px' }}>
            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px', lineHeight: '1.2' }}>
                  {formatAmount(reportData.reduce((sum, item) => sum + item.revenue, 0))}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600' }}>Total Revenue</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', marginBottom: '4px', lineHeight: '1.2' }}>
                  {reportData.reduce((sum, item) => sum + item.orders, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600' }}>Total Orders</div>
              </div>
              <div style={{ padding: '10px 12px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px', lineHeight: '1.2' }}>
                  {formatAmount(reportData.reduce((sum, item) => sum + item.revenue, 0) / reportData.reduce((sum, item) => sum + item.orders, 0) || 0)}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '600' }}>Avg Order Value</div>
              </div>
            </div>
            
            {/* Revenue Trend Chart */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '10px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#e8eaed' : '#1e293b', padding: '0' }}>
                Revenue Trend ({selectedCurrency})
              </h4>
              <div style={{ height: '220px', marginTop: '0', padding: '0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d3142' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#64748b'}
                      tick={{ fill: isDark ? '#9aa0a6' : '#64748b', fontSize: '8px' }}
                      height={40}
                    />
                    <YAxis 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#64748b'}
                      tick={{ fill: isDark ? '#9aa0a6' : '#64748b', fontSize: '8px' }}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1a1d29' : '#ffffff',
                        border: isDark ? '1px solid #2d3142' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                        color: isDark ? '#e8eaed' : '#1e293b',
                        fontSize: '9px',
                        padding: '6px 8px'
                      }}
                      labelStyle={{ color: isDark ? '#e8eaed' : '#1e293b', fontSize: '9px' }}
                      itemStyle={{ color: isDark ? '#e8eaed' : '#1e293b', fontSize: '9px' }}
                      formatter={(value, name) => {
                        if (name === `Revenue (${selectedCurrency})`) {
                          return [formatAmount(parseFloat(value)), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      name={`Revenue (${selectedCurrency})`}
                      dot={{ fill: '#3b82f6', r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981" 
                      strokeWidth={1.5} 
                      name="Orders"
                      dot={{ fill: '#10b981', r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Orders & Customer Activity Chart */}
            <div>
              <h4 style={{ fontSize: '10px', fontWeight: '600', marginBottom: '8px', color: isDark ? '#e8eaed' : '#1e293b', padding: '0' }}>
                Orders & Customer Activity
              </h4>
              <div style={{ height: '200px', marginTop: '0', padding: '0' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d3142' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#64748b'}
                      tick={{ fill: isDark ? '#9aa0a6' : '#64748b', fontSize: '8px' }}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#64748b'}
                      tick={{ fill: isDark ? '#9aa0a6' : '#64748b', fontSize: '8px' }}
                      width={50}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1a1d29' : '#ffffff',
                        border: isDark ? '1px solid #2d3142' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
                        color: isDark ? '#e8eaed' : '#1e293b',
                        fontSize: '9px',
                        padding: '6px 8px'
                      }}
                      labelStyle={{ color: isDark ? '#e8eaed' : '#1e293b', fontSize: '9px' }}
                      itemStyle={{ color: isDark ? '#e8eaed' : '#1e293b', fontSize: '9px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                    <Bar 
                      dataKey="orders" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="Daily Orders"
                    />
                    <Bar 
                      dataKey="customers" 
                      fill="#f59e0b" 
                      radius={[4, 4, 0, 0]}
                      name="Unique Customers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: '10px' }}>
          <div style={{ padding: '30px 12px', textAlign: 'center' }}>
            <FiFileText style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '10px' }} />
            <h3 style={{ color: '#64748b', marginBottom: '6px', fontSize: '11px' }}>No Data Available</h3>
            <p style={{ color: '#94a3b8', fontSize: '9px' }}>
              No revenue data found for the selected range ({rangeSummary}). 
              {reportData.length === 0 && !loading && ' Try selecting a different time period or adding some orders.'}
            </p>
          </div>
        </div>
      )}

      {/* Download PDF Button - Moved to bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', marginBottom: '10px' }}>
        <button 
          className="btn btn-export"
          onClick={downloadReport}
          disabled={loading || reportData.length === 0}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 12px', 
            fontSize: '10px', 
            fontWeight: '600',
            opacity: (loading || reportData.length === 0) ? 0.5 : 1,
            cursor: (loading || reportData.length === 0) ? 'not-allowed' : 'pointer',
            minHeight: '28px'
          }}
        >
          <FiDownload style={{ fontSize: '12px' }} />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default RevenueReports;
