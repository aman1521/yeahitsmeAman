import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiTarget,
  FiUsers,
  FiShoppingCart,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import apiClient from '../services/apiClient';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';

const RevenueAnalytics = () => {
  const { isDark } = useTheme();
  const { formatAmount, currencySymbol, selectedCurrency } = useGlobalCurrency();
  
  const RADIAN = Math.PI / 180;

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

  const renderCategoryLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (!name) return null;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#475569"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="middle"
        style={{ fontSize: '8px', fontWeight: 500 }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    growthRate: 0,
    targetRevenue: 10000.00,
    targetProgress: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // Connected state!
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [rangeMode, setRangeMode] = useState('preset');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [rangeMeta, setRangeMeta] = useState(null);

  useEffect(() => {
    if (rangeMode === 'custom' && (!customRange.start || !customRange.end)) {
      return;
    }
    fetchRevenueData();
  }, [selectedCurrency, timeRange, rangeMode, customRange.start, customRange.end]); // Re-fetch when dependencies change

  useEffect(() => {
    if (rangeMode === 'custom' && rangeMeta?.range) {
      setCustomRange((prev) => ({
        start: prev.start || rangeMeta.range.start_date,
        end: prev.end || rangeMeta.range.end_date
      }));
    }
  }, [rangeMode, rangeMeta]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      if (rangeMode === 'custom') {
        if (!customRange.start || !customRange.end) {
          console.warn('[Revenue Analytics] Custom range incomplete, skipping fetch');
          setLoading(false);
          return;
        }
        const startDateObj = parseInputDate(customRange.start);
        const endDateObj = parseInputDate(customRange.end);
        if (!startDateObj || !endDateObj) {
          toast.error('Invalid date selection. Please pick valid dates.');
          setLoading(false);
          return;
        }
        if (startDateObj > endDateObj) {
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
        rangeParams = { days: parseInt(timeRange, 10) };
      }

      console.log('[Revenue Analytics] Fetching data with params:', rangeParams, 'currency:', selectedCurrency);
      
      // Fetch all data in parallel - let errors propagate so we can see them
      const [statsRes, chartRes, productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/dashboard/stats', { params: rangeParams }),
        apiClient.get('/dashboard/sales-chart', { params: rangeParams }),
        apiClient.get('/dashboard/top-products', { params: { limit: 10, ...rangeParams } }).catch(() => ({ data: { products: [] } })),
        apiClient.get('/dashboard/sales-by-category', { params: rangeParams }).catch(() => ({ data: { categories: [] } }))
      ]);

      const stats = statsRes.data || {};
      const chartData = chartRes.data?.chart_data || [];
      const products = productsRes.data?.products || [];
      const categoryData = categoriesRes.data?.categories || [];
      
      console.log('[Revenue Analytics] API Response Summary:', {
        stats: Object.keys(stats),
        statsData: stats,
        chartDataPoints: chartData.length,
        productsCount: products.length,
        categoriesCount: categoryData.length,
        fullStatsResponse: statsRes.data,
        fullChartResponse: chartRes.data
      });

      setRangeMeta(stats.meta || chartRes.data?.meta || null);
      
      console.log('[Revenue Analytics] Categories from API:', categoryData);
      
      // Check if we actually got data
      if (!stats || Object.keys(stats).length === 0) {
        console.warn('[Revenue Analytics] ⚠️ Stats response is empty!');
        toast.error('No statistics data received from server. Please check backend connection.');
      }
      
      if (!chartData || chartData.length === 0) {
        console.warn('[Revenue Analytics] ⚠️ Chart data is empty!');
        // Don't show error toast for empty chart data - it might just mean no sales in the period
      }
      
      // Calculate metrics from chart data
      const chartRevenueTotal = chartData.reduce((sum, item) => sum + (parseFloat(item.sales) || 0), 0);
      const chartOrdersTotal = chartData.reduce((sum, item) => sum + (parseInt(item.orders) || 0), 0);
      const chartCustomersTotal = chartData.reduce((sum, item) => sum + (parseInt(item.customers) || 0), 0);
      const chartProductsTotal = chartData.reduce((sum, item) => sum + (parseInt(item.products_sold) || 0), 0);

      // Extract revenue - check multiple possible paths in the response
      // Use ONLY the current period data - no fallback to lifetime
      const periodRevenue = stats.sales?.current_period ?? 
                           stats.sales?.total ?? 
                           stats.revenue?.total ?? 
                           stats.revenue?.current_period ?? 
                           chartRevenueTotal;
      
      // Extract growth rate - if -100, it means no current period data, show as 0
      const growthRate = (stats.sales?.change_percentage === -100 || stats.revenue?.growth === -100) 
                        ? 0 
                        : (stats.sales?.change_percentage ?? 
                           stats.revenue?.growth ?? 
                           (stats.sales?.previous_period && stats.sales?.current_period 
                             ? ((stats.sales.current_period - stats.sales.previous_period) / stats.sales.previous_period * 100)
                             : 0));
      
      // Extract orders count - use ONLY current period
      const ordersCount = stats.orders?.total ?? 
                         stats.orders?.current_period ?? 
                         chartOrdersTotal;
      
      // Extract customers count - CRITICAL: Customers = users who placed orders (conversions), not all users
      // Use conversions from stats (users who placed orders) instead of all users
      const customersCount = stats.conversion?.conversions ?? 
                            chartCustomersTotal ??
                            stats.users?.total ?? 
                            stats.users?.current_period ?? 
                            0;
      
      console.log('[Revenue Analytics] Extracted values:', {
        periodRevenue,
        growthRate,
        ordersCount,
        customersCount,
        dateRange: rangeMeta?.range || `Last ${timeRange} days`,
        statsKeys: Object.keys(stats),
        salesKeys: stats.sales ? Object.keys(stats.sales) : null,
        revenueKeys: stats.revenue ? Object.keys(stats.revenue) : null
      });
      
      // Log when there's no data for the selected period (this is expected behavior)
      if (periodRevenue === 0 && ordersCount === 0 && customersCount === 0) {
        console.log('[Revenue Analytics] No data for selected period:', {
          dateRange: rangeMeta?.range || `Last ${timeRange} days`,
          message: 'This is normal if there are no paid orders in the selected date range'
        });
      }
      const conversionRateValue = stats.conversion?.rate ?? (ordersCount > 0 ? (chartProductsTotal > 0 ? (chartProductsTotal / ordersCount) * 100 : 0) : 0);
      const conversionGrowth = stats.conversion?.growth ?? 0;
      const avgOrderValue = ordersCount > 0 ? periodRevenue / ordersCount : 0;
      
      // Fetch revenue settings to get actual targets
      let targetValue = 10000.00; // Default fallback
      try {
        const settingsRes = await apiClient.get('/settings/revenue');
        if (settingsRes.data?.settings) {
          const settings = settingsRes.data.settings;
          // Use monthly target by default, or quarterly/yearly based on date range
          const days = rangeMeta?.range?.days || parseInt(timeRange, 10);
          if (days <= 31) {
            targetValue = settings.monthlyTarget || 10000.00;
          } else if (days <= 93) {
            targetValue = settings.quarterlyTarget || 30000.00;
          } else {
            targetValue = settings.yearlyTarget || 120000.00;
          }
        }
      } catch (settingsErr) {
        console.warn('[Revenue Analytics] Could not fetch revenue settings, using default target');
      }
      
      // Calculate target progress
      const targetProgress = targetValue > 0 ? (periodRevenue / targetValue) * 100 : 0;

      // Set main revenue data
      setRevenueData({
        totalRevenue: periodRevenue,
        monthlyRevenue: stats.sales?.current_period ?? periodRevenue,
        dailyRevenue: chartData.length > 0 ? periodRevenue / chartData.length : 0,
        growthRate: growthRate,
        targetRevenue: targetValue,
        targetProgress: Math.min(targetProgress, 100),
        conversionRate: conversionRateValue,
        avgOrderValue: avgOrderValue,
        totalOrders: ordersCount,
        totalCustomers: customersCount
      });

      // Sort chart data by date
      const sortedChartData = chartData.map(item => ({
        date: item.date,
        revenue: parseFloat(item.sales) || 0,
        orders: parseInt(item.orders) || 0,
        customers: parseInt(item.customers) || 0,
        products_sold: parseInt(item.products_sold) || 0,
        avgOrderValue: item.orders > 0 ? (parseFloat(item.sales) / parseInt(item.orders)) : 0
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log('[Revenue Analytics] Chart data sample:', sortedChartData[0]);
      console.log('[Revenue Analytics] Revenue values:', sortedChartData.map(d => d.revenue));
      console.log('[Revenue Analytics] Total data points:', sortedChartData.length);
      
      setChartData(sortedChartData);

      // Process top products for visualization
      const colorPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
      const topProductsData = products.slice(0, 8).map((p, index) => ({
        name: p.name || `Product ${index + 1}`,
        revenue: parseFloat(p.revenue) || 0,
        orders: parseInt(p.orders) || 0,
        percentage: parseFloat(p.percentage) || 0,
        color: colorPalette[index % colorPalette.length]
      }));
      
      setTopProducts(topProductsData);

      // Use category data directly from API (already has revenue calculated!)
      const categoryRevenue = categoryData.map(cat => ({
        name: cat.name,
        revenue: parseFloat(cat.revenue) || parseFloat(cat.value) || 0,
        percentage: parseFloat(cat.percentage) || 0,
        color: cat.color || colorPalette[Math.floor(Math.random() * colorPalette.length)]
      }));
      
      console.log('[Revenue Analytics] Category revenue:', categoryRevenue);
      setRevenueByCategory(categoryRevenue);

      // Performance metrics
      const metrics = [
        {
          metric: 'Average Order Value',
          value: avgOrderValue,
          change: growthRate > 0 ? growthRate : 0,
          trend: growthRate >= 0 ? 'up' : 'down'
        },
        {
          metric: 'Revenue per Customer',
          value: customersCount > 0 ? periodRevenue / customersCount : 0,
          change: 0,
          trend: 'neutral'
        },
        {
          metric: 'Conversion Rate',
          value: conversionRateValue,
          change: conversionGrowth,
          trend: conversionGrowth === 0 ? 'neutral' : conversionGrowth > 0 ? 'up' : 'down',
          isPercentage: true
        },
        {
          metric: 'Revenue Growth',
          value: growthRate,
          change: growthRate,
          trend: growthRate >= 0 ? 'up' : 'down',
          isPercentage: true
        }
      ];
      
      setPerformanceMetrics(metrics);
      
      console.log(`[Revenue Analytics] Data loaded: ${chartData.length} days, ${products.length} products`);

    } catch (error) {
      console.error('[Revenue Analytics] Error fetching revenue data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      console.error('[Revenue Analytics] Full error details:', {
        message: errorMessage,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Only show toast for actual errors, not empty data
      if (error.response?.status !== 404 && !errorMessage.includes('No data')) {
        toast.error(`Failed to load revenue data: ${errorMessage}`);
      } else {
        console.log('[Revenue Analytics] No data available for selected period');
      }
      
      setRangeMeta(null);
      
      // Set default empty state
      setRevenueData({
        totalRevenue: 0,
        monthlyRevenue: 0,
        dailyRevenue: 0,
        growthRate: 0,
        targetRevenue: 10000,
        targetProgress: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        totalOrders: 0,
        totalCustomers: 0
      });
      setChartData([]);
      setTopProducts([]);
      setRevenueByCategory([]);
      setPerformanceMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, growth, icon: Icon, color, subtitle, isPercentage }) => {
    const growthNumber = Number(growth);
    const safeGrowth = Number.isFinite(growthNumber) ? growthNumber : 0;
    const growthLabel = `${Math.abs(safeGrowth).toFixed(1)}%`;

    return (
    <div className="stat-card" style={{ 
      background: isDark ? '#161b22' : '#ffffff',
      padding: '10px 12px',
      borderRadius: '6px',
      boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)',
      border: isDark ? '1px solid #30363d' : '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div style={{ fontSize: '9px', color: isDark ? '#8b949e' : '#64748b', fontWeight: '600', lineHeight: '1.3' }}>{title}</div>
        <div style={{ 
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          background: isDark ? `${color}20` : `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          flexShrink: 0
        }}>
          <Icon size={12} />
        </div>
      </div>
      <div style={{ fontSize: '16px', fontWeight: '700', color: isDark ? '#e6edf3' : '#1e293b', marginBottom: '4px', lineHeight: '1.2' }}>
        {value}
      </div>
      {subtitle && <div style={{ fontSize: '8px', color: isDark ? '#8b949e' : '#94a3b8', marginBottom: '4px', lineHeight: '1.3' }}>{subtitle}</div>}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '3px',
        fontSize: '8px',
        color: safeGrowth >= 0 ? '#10b981' : '#ef4444',
        fontWeight: '600',
        lineHeight: '1.3'
      }}>
        {safeGrowth >= 0 ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
        {growthLabel} from last period
      </div>
    </div>
  );};

  const getMetricValueDisplay = (metric) => {
    if (metric.isPercentage) {
      const numericValue = Number(metric.value);
      return `${Number.isFinite(numericValue) ? numericValue.toFixed(1) : '0.0'}%`;
    }
    const numericValue = Number(metric.value);
    return formatAmount(Number.isFinite(numericValue) ? numericValue : 0);
  };

  const getMetricChangeDisplay = (metric) => {
    const numericChange = Number(metric.change);
    if (Number.isFinite(numericChange) && numericChange !== 0) {
      return `${Math.abs(numericChange).toFixed(1)}%`;
    }
    return '-';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '300px',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 14px'
      }}>
        <div className="spinner" style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>Loading revenue analytics...</div>
      </div>
    );
  }

  const rangeSummary = rangeMeta
    ? `${rangeMeta.range.start_date} → ${rangeMeta.range.end_date}`
    : rangeMode === 'custom'
      ? (customRange.start && customRange.end ? `${customRange.start} → ${customRange.end}` : 'Custom dates')
      : `Last ${timeRange} days`;

  return (
    <div className="page-container" style={{ padding: '12px 14px' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div className="page-header-text" style={{ gap: '3px', flex: '1', minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: '18px', marginBottom: '2px', lineHeight: '1.3' }}>Revenue Analytics</h1>
          <p className="page-subtitle" style={{ fontSize: '11px', margin: 0, lineHeight: '1.4' }}>Comprehensive revenue insights and performance metrics</p>
          {rangeMeta ? (
            <div style={{ color: isDark ? '#8b949e' : '#94a3b8', fontSize: '9px', marginTop: '4px', lineHeight: '1.3' }}>
              Showing data from {rangeMeta.range.start_date} to {rangeMeta.range.end_date}
            </div>
          ) : (
            <div style={{ color: isDark ? '#8b949e' : '#94a3b8', fontSize: '9px', marginTop: '4px', lineHeight: '1.3' }}>
              {rangeMode === 'preset' ? `Last ${timeRange} days` : 'Custom date range'}
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
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
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
            onClick={fetchRevenueData}
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

      {/* Revenue Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '8px',
        marginBottom: '12px'
      }}>
        <StatCard
          title="Total Revenue"
          value={formatAmount(revenueData.totalRevenue)}
          growth={revenueData.growthRate}
          icon={FiDollarSign}
          color="#10b981"
          subtitle={rangeSummary}
        />
        <StatCard
          title="Average Order Value"
          value={formatAmount(revenueData.avgOrderValue)}
          growth={revenueData.growthRate}
          icon={FiShoppingCart}
          color="#3b82f6"
          subtitle={`${revenueData.totalOrders} orders in range`}
        />
        <StatCard
          title="Total Customers"
          value={revenueData.totalCustomers.toLocaleString()}
          growth={revenueData.growthRate}
          icon={FiUsers}
          color="#f59e0b"
          subtitle={rangeSummary}
        />
        <StatCard
          title="Target Progress"
          value={`${revenueData.targetProgress.toFixed(1)}%`}
          growth={revenueData.growthRate}
          icon={FiTarget}
          color="#8b5cf6"
          subtitle={`${formatAmount(revenueData.targetRevenue)} target`}
        />
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {/* Revenue Trend Chart */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '10px 12px', marginBottom: '0', borderBottom: `1px solid ${isDark ? '#2d3142' : '#e2e8f0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '0' }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: '10px', fontWeight: '600', color: isDark ? '#e8eaed' : '#1e293b', lineHeight: '1.3' }}>
                {selectedMetric === 'revenue' ? 'Revenue Trend' : 
                 selectedMetric === 'orders' ? 'Orders Trend' :
                 selectedMetric === 'customers' ? 'Customers Trend' :
                 'Avg Order Value Trend'}
              </h3>
            <select 
              className="form-select" 
                style={{ width: '120px', fontSize: '8px', padding: '2px 4px', minHeight: '22px', flexShrink: 0 }}
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="avgOrderValue">Avg Order Value</option>
            </select>
            </div>
          </div>
          <div style={{ padding: '10px 12px 8px 12px', height: '220px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === 'revenue' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d3142' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#94a3b8'}
                      tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
                    />
                    <YAxis 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#94a3b8'}
                      tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
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
                        if (name.includes('Revenue') || name.includes('Value')) {
                          return [formatAmount(value), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={`Revenue (${selectedCurrency})`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#10b981"
                      strokeWidth={1.5}
                      dot={{ fill: '#10b981', r: 2 }}
                      name="Orders"
                    />
                  </AreaChart>
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d3142' : '#e2e8f0'} />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#94a3b8'}
                      tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
                    />
                    <YAxis 
                      style={{ fontSize: '8px' }}
                      stroke={isDark ? '#9aa0a6' : '#94a3b8'}
                      tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
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
                        if (name.includes('Revenue') || name.includes('Value')) {
                          return [formatAmount(value), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
                    {selectedMetric === 'orders' && (
                      <Bar dataKey="orders" fill="#10b981" name="Orders" radius={[4, 4, 0, 0]} />
                    )}
                    {selectedMetric === 'customers' && (
                      <Bar dataKey="customers" fill="#f59e0b" name="Customers" radius={[4, 4, 0, 0]} />
                    )}
                    {selectedMetric === 'avgOrderValue' && (
                      <Line 
                        type="monotone" 
                        dataKey="avgOrderValue" 
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 2 }}
                        name={`Avg Order Value (${selectedCurrency})`}
                      />
                    )}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '9px'
              }}>
                No data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Category - Pie Chart */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '10px 12px' }}>
            <h3 className="card-title" style={{ fontSize: '10px', lineHeight: '1.3' }}>Revenue by Category</h3>
          </div>
          <div style={{ padding: '10px 12px 8px 12px', height: '220px' }}>
            {revenueByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="revenue"
                    labelLine={false}
                    label={renderCategoryLabel}
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, { payload }) => [
                      formatAmount(value),
                      `${payload?.name || name}`
                    ]}
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
                  <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: '9px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                color: '#94a3b8'
              }}>
                <FiPieChart size={24} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: '9px' }}>No category data available</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* Top Products - Bar Chart */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '10px 12px' }}>
            <h3 className="card-title" style={{ fontSize: '10px', lineHeight: '1.3' }}>Top Products by Revenue</h3>
          </div>
          <div style={{ padding: '10px 12px 8px 12px', height: '200px' }}>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" style={{ fontSize: '8px' }} tick={{ fontSize: 8 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120}
                    style={{ fontSize: '8px' }}
                    tick={{ fontSize: 8 }}
                  />
                  <Tooltip 
                    formatter={(value) => formatAmount(value)}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '9px',
                      padding: '6px 8px'
                    }}
                    labelStyle={{ fontSize: '9px' }}
                    itemStyle={{ fontSize: '9px' }}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                color: '#94a3b8'
              }}>
                <FiBarChart2 size={24} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: '9px' }}>No product data available</div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics Table */}
        <div className="card" style={{ padding: '0' }}>
          <div className="card-header" style={{ padding: '10px 12px' }}>
            <h3 className="card-title" style={{ fontSize: '10px', lineHeight: '1.3' }}>Performance Metrics</h3>
          </div>
          <div style={{ padding: '10px 12px' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid #e2e8f0', fontSize: '8px', fontWeight: '600' }}>Metric</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #e2e8f0', fontSize: '8px', fontWeight: '600' }}>Value</th>
                  <th style={{ textAlign: 'right', padding: '4px 6px', borderBottom: '1px solid #e2e8f0', fontSize: '8px', fontWeight: '600' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {performanceMetrics.map((metric, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '4px 6px', fontSize: '8px', color: '#475569', lineHeight: '1.3' }}>
                      {metric.metric}
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', fontSize: '8px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>
                      {getMetricValueDisplay(metric)}
                    </td>
                    <td style={{ padding: '4px 6px', textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '8px',
                        fontWeight: '600',
                        color: metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#94a3b8',
                        lineHeight: '1.3'
                      }}>
                        {metric.trend === 'up' && <FiTrendingUp size={10} />}
                        {metric.trend === 'down' && <FiTrendingDown size={10} />}
                        {getMetricChangeDisplay(metric)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
