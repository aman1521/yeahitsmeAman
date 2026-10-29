import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign,
  FiEye,
  FiDownload,
  FiFilter,
  FiCalendar
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { useTheme } from '../contexts/ThemeContext';
import apiClient from '../services/apiClient';

const Analytics = () => {
  const { formatAmount, currencySymbol, currencyName, selectedCurrency } = useGlobalCurrency();
  const { isDark } = useTheme();
  const RADIAN = Math.PI / 180;

  // Custom label renderer for pie chart to prevent overlap - Compact version
  const renderCategoryLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (!name) return null;
    const radius = outerRadius + 12;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill={isDark ? '#cbd5e1' : '#475569'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="middle"
        style={{ fontSize: '7px', fontWeight: 500 }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const [analyticsData, setAnalyticsData] = useState({
    revenue: { total: 374.96, growth: 12.5 },
    orders: { total: 3, growth: 8.2 },
    customers: { total: 2, growth: 15.3 },
    conversion: { rate: 3.2, growth: -2.1 }
  });
  const [chartData, setChartData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodPreset, setPeriodPreset] = useState('30');
  const [rangeMode, setRangeMode] = useState('preset');

  // Inject CSS to ensure chart titles and card headers are properly sized
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        .analytics-page .chart-title {
          font-size: 9px !important;
        }
        .analytics-page .card-header .card-title[style*="fontSize: '6px'"],
        .analytics-page .card-header .card-title[style*='fontSize: "6px"'],
        .analytics-page .card-header .card-title[style*="fontSize: 6px"],
        .analytics-page .card-header h3[style*="fontSize: '6px'"],
        .analytics-page .card-header h3[style*='fontSize: "6px"'],
        .analytics-page .card-header h3[style*="fontSize: 6px"] {
          font-size: 6px !important;
          line-height: 1.2 !important;
        }
      `;
      style.id = 'analytics-chart-title-overrides';
      if (!document.getElementById('analytics-chart-title-overrides')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('analytics-chart-title-overrides');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [rangeMeta, setRangeMeta] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [revenueChartView, setRevenueChartView] = useState('daily');

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

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Fill in missing dates with 0 values
  const fillMissingDates = (data, startDateObj, endDateObj) => {
    const filledData = [];
    if (!startDateObj || !endDateObj) return filledData;

    const dataMap = new Map();
    data.forEach(item => dataMap.set(item.date, item));
    
    const currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      filledData.push({
        date: dateStr,
        sales: dataMap.has(dateStr) ? dataMap.get(dateStr).sales : 0,
        orders: dataMap.has(dateStr) ? dataMap.get(dateStr).orders : 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filledData;
  };

  useEffect(() => {
    if (rangeMode === 'custom' && (!customRange.start || !customRange.end)) {
      return;
    }
    fetchAnalyticsData();
  }, [periodPreset, revenueChartView, rangeMode, customRange.start, customRange.end]);

  useEffect(() => {
    if (rangeMode === 'custom' && rangeMeta?.range) {
      setCustomRange((prev) => ({
        start: prev.start || rangeMeta.range.start_date,
        end: prev.end || rangeMeta.range.end_date
      }));
    }
  }, [rangeMode, rangeMeta]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const isCustom = rangeMode === 'custom';
      const presetDays = parseInt(periodPreset, 10);

      let startDateObj;
      let endDateObj;

      if (isCustom) {
        if (!customRange.start || !customRange.end) {
          setLoading(false);
          return;
        }
        startDateObj = parseInputDate(customRange.start);
        endDateObj = parseInputDate(customRange.end);
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
      } else {
        endDateObj = startOfDay(new Date());
        startDateObj = new Date(endDateObj);
        startDateObj.setDate(endDateObj.getDate() - (presetDays - 1));
      }

      startDateObj = startOfDay(startDateObj);
      endDateObj = startOfDay(endDateObj || new Date());

      const startIso = startDateObj.toISOString().split('T')[0];
      const endIso = endDateObj.toISOString().split('T')[0];

      const baseParams = isCustom
        ? { start_date: startIso, end_date: endIso }
        : { days: presetDays };

      const chartParams = isCustom
        ? { start_date: startIso, end_date: endIso, view: revenueChartView }
        : { days: presetDays, view: revenueChartView };
      
      // Fetch all data in parallel for better performance
      const [statsResponse, chartResponse, productsResponse, categoriesResponse, distributionResponse] = await Promise.all([
        apiClient.get('/dashboard/stats', { params: baseParams }),
        apiClient.get('/dashboard/sales-chart', { params: chartParams }),
        apiClient.get('/dashboard/top-products', { params: { limit: 5, ...baseParams } }),
        apiClient.get('/dashboard/sales-by-category', { params: baseParams }),
        apiClient.get('/dashboard/customer-distribution', { params: baseParams })
      ]);

      const stats = statsResponse.data || {};
      const rawChartData = chartResponse.data?.chart_data || [];
      const topProducts = productsResponse.data?.products || [];
      const categories = categoriesResponse.data?.categories || [];
      const distribution = distributionResponse.data?.distribution || [];

      setRangeMeta(statsResponse.data?.meta || chartResponse.data?.meta || null);

      // DEBUG: Log stats data to verify conversion rate calculation
      console.log('[Analytics] Stats data from backend:', {
        users_total: stats.users?.total,
        users_growth: stats.users?.growth,
        conversion_rate: stats.conversion?.rate,
        conversion_conversions: stats.conversion?.conversions,
        conversion_growth: stats.conversion?.growth,
        customers_total: stats.customers?.total,
        orders_total: stats.orders?.total
      });

      // Calculate customers count - use active users (users who placed orders in period)
      // This should match the sum of new + returning customers from distribution
      const customersCount = stats.customers?.total || 
                            stats.conversion?.conversions || 
                            stats.users?.active || 
                            0;
      
      console.log('[Analytics] Customer count calculation:', {
        customers_total: stats.customers?.total,
        conversions: stats.conversion?.conversions,
        users_active: stats.users?.active,
        final_count: customersCount
      });

      // Set real analytics data with proper calculations
      setAnalyticsData({
        revenue: { 
          total: stats.revenue?.total || stats.sales?.total || 0, 
          growth: stats.revenue?.growth || stats.sales?.change_percentage || 0 
        },
        orders: { 
          total: stats.orders?.total || 0, 
          growth: stats.orders?.change_percentage || stats.orders?.growth || 0 
        },
        customers: { 
          // Customers = users who placed orders (active users or conversions)
          total: customersCount, 
          growth: stats.customers?.growth || stats.conversion?.growth || 0 
        },
        conversion: { 
          // CRITICAL: Conversion rate = (customers who placed orders / total users) * 100
          // If backend provides rate, use it; otherwise calculate from conversions/users
          rate: (() => {
            if (stats.conversion?.rate) {
              console.log('[Analytics] Using backend conversion rate:', stats.conversion.rate);
              return stats.conversion.rate;
            }
            
            const conversions = stats.conversion?.conversions || stats.customers?.total || 0;
            const totalUsers = stats.users?.total || 0;
            
            if (conversions > 0 && totalUsers > 0) {
              const calculatedRate = parseFloat(((conversions / totalUsers) * 100).toFixed(1));
              console.log('[Analytics] Calculated conversion rate:', {
                conversions,
                totalUsers,
                calculatedRate: `${calculatedRate}%`,
                formula: `(${conversions} / ${totalUsers}) * 100 = ${calculatedRate}%`
              });
              return calculatedRate;
            }
            
            console.log('[Analytics] Cannot calculate conversion rate - missing data:', { conversions, totalUsers });
            return 0;
          })(), 
          growth: stats.conversion?.growth || 0 
        }
      });

      // CRITICAL FIX: Fill in missing dates with 0 values for complete date range
      const filledChartData = fillMissingDates(rawChartData, startDateObj, endDateObj);

      // Format chart data based on view (daily, weekly, monthly)
      let formattedChartData = [];
      
      if (revenueChartView === 'daily') {
        // Daily view - show each day
        formattedChartData = filledChartData.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: item.sales || 0,
          orders: item.orders || 0
        }));
      } else if (revenueChartView === 'weekly') {
        // Weekly view - group by week
        const weeklyData = {};
        filledChartData.forEach(item => {
          const date = new Date(item.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { name: weekKey, revenue: 0, orders: 0 };
          }
          weeklyData[weekKey].revenue += item.sales || 0;
          weeklyData[weekKey].orders += item.orders || 0;
        });
        formattedChartData = Object.values(weeklyData);
      } else {
        // Monthly view - group by month
        const monthlyData = {};
        filledChartData.forEach(item => {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { name: monthYear, revenue: 0, orders: 0 };
          }
          monthlyData[monthYear].revenue += item.sales || 0;
          monthlyData[monthYear].orders += item.orders || 0;
        });
        formattedChartData = Object.values(monthlyData);
      }

      setChartData(formattedChartData);

      // Use real category sales data - ensure it's an array
      if (Array.isArray(categories) && categories.length > 0) {
        setSalesData(categories);
      } else {
        console.log('[Analytics] No category data available');
        setSalesData([]);
      }

      // Use real customer distribution data - ensure it's an array
      if (Array.isArray(distribution) && distribution.length > 0) {
        // Calculate total from distribution to verify consistency
        const distributionTotal = distribution.reduce((sum, item) => sum + (item.value || 0), 0);
        console.log('[Analytics] Customer distribution:', {
          distribution,
          distributionTotal,
          customersCount,
          match: distributionTotal === customersCount
        });
        
        // If totals don't match, log warning but still use distribution data
        if (distributionTotal !== customersCount && customersCount > 0) {
          console.warn('[Analytics] Customer count mismatch:', {
            distributionTotal,
            customersCount,
            difference: Math.abs(distributionTotal - customersCount)
          });
        }
        
        setCustomerData(distribution);
      } else {
        console.log('[Analytics] No customer distribution data available');
        // Set default structure
        setCustomerData([
          {'name': 'New Customers', 'value': 0, 'color': '#3b82f6'},
          {'name': 'Returning Customers', 'value': 0, 'color': '#10b981'}
        ]);
      }

      // Store top products for the table - ensure it's an array
      if (Array.isArray(topProducts) && topProducts.length > 0) {
        setTopProductsData(topProducts);
      } else {
        console.log('[Analytics] No top products data available');
        setTopProductsData([]);
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load analytics data. Please refresh the page.');
      
      // Fallback to basic data if API fails
      setAnalyticsData({
        revenue: { total: 0, growth: 0 },
        orders: { total: 0, growth: 0 },
        customers: { total: 0, growth: 0 },
        conversion: { rate: 0, growth: 0 }
      });
      setChartData([]);
      setSalesData([]);
      setCustomerData([
        {'name': 'New Customers', 'value': 0, 'color': '#3b82f6'},
        {'name': 'Returning Customers', 'value': 0, 'color': '#10b981'}
      ]);
      setTopProductsData([]);
    } finally {
      setLoading(false);
    }
  };


  const StatCard = ({ title, value, growth, icon: Icon, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-title">{title}</div>
        <div className={`stat-icon ${color}`}>
          <Icon />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${growth >= 0 ? 'positive' : 'negative'}`}>
        {growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
        {Math.abs(growth)}% from last month
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '268px' }}>
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  const rangeLabel = rangeMode === 'preset'
    ? `Last ${periodPreset} days`
    : 'Custom Range';

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Track performance metrics, revenue trends, and customer insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatAmount(analyticsData.revenue.total, 'INR')}
          growth={analyticsData.revenue.growth}
          icon={FiDollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.orders.total}
          growth={analyticsData.orders.growth}
          icon={FiShoppingCart}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Customers"
          value={analyticsData.customers.total}
          growth={analyticsData.customers.growth}
          icon={FiUsers}
          color="bg-purple-500"
        />
        <StatCard
          title="Conversion Rate"
          value={`${analyticsData.conversion.rate}%`}
          growth={analyticsData.conversion.growth}
          icon={FiTrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '13px', marginBottom: '0' }}>
        {/* Revenue Chart */}
        <div className="chart-container">
          <div className="chart-header" style={{ padding: '6px 8px 4px 8px', marginBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="chart-title" style={{ margin: 0, fontSize: '9px', fontWeight: '600', lineHeight: '1.2' }}>
                Revenue Trend
              </h3>
              <div style={{ fontSize: '7px', color: isDark ? '#8b949e' : '#94a3b8', fontWeight: '500', lineHeight: '1.2' }}>
                {rangeLabel}
              </div>
            </div>
            <div className="chart-controls">
              <div className="chart-control-group">
                <FiCalendar style={{ fontSize: '9px', color: isDark ? '#58a6ff' : '#64748b' }} />
                <select 
                  className="form-select" 
                  style={{ width: '101px' }}
                  value={rangeMode}
                  onChange={(e) => setRangeMode(e.target.value)}
                >
                  <option value="preset">Quick Range</option>
                  <option value="custom">Custom Dates</option>
                </select>
                {rangeMode === 'preset' ? (
                  <select 
                    className="form-select" 
                    style={{ width: '101px' }}
                    value={periodPreset}
                    onChange={(e) => setPeriodPreset(e.target.value)}
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="60">Last 60 Days</option>
                    <option value="90">Last Quarter</option>
                    <option value="180">Last 6 Months</option>
                    <option value="365">Last Year</option>
                  </select>
                ) : (
                  <div className="compact-date-range">
                    <FiCalendar style={{ color: isDark ? '#58a6ff' : '#64748b', fontSize: '9px', flexShrink: 0 }} />
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                    />
                    <span style={{ color: isDark ? '#8b949e' : '#94a3b8', fontSize: '9px' }}>→</span>
                    <input
                      type="date"
                      value={customRange.end}
                      min={customRange.start || undefined}
                      onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                )}
              </div>
              <div className="chart-control-group">
                <FiFilter style={{ fontSize: '9px', color: isDark ? '#58a6ff' : '#64748b' }} />
                <select 
                  className="form-select" 
                  style={{ width: '87px' }}
                  value={revenueChartView}
                  onChange={(e) => setRevenueChartView(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ height: '201px', marginTop: '0', padding: '0 4px 0 4px', overflow: 'visible' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    height={70}
                    angle={-45}
                    textAnchor="end"
                    dy={12}
                  />
                  <YAxis 
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    label={{ 
                      value: `Revenue (${currencySymbol})`, 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: isDark ? '#cbd5e1' : '#94a3b8', fontSize: 8 }
                    }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      color: '#f1f5f9',
                      fontSize: '9px',
                      padding: '8px 11px'
                    }}
                    labelStyle={{
                      color: '#cbd5e1',
                      fontSize: '8px',
                      fontWeight: '600',
                      marginBottom: '5px'
                    }}
                    itemStyle={{
                      color: '#f1f5f9',
                      fontSize: '9px'
                    }}
                    formatter={(value) => formatAmount(value, 'INR')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FF8C00" 
                    strokeWidth={2}
                    name={`Revenue (${currencySymbol})`}
                    dot={{ fill: '#FF8C00', r: 3 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: '#94a3b8', fontSize: '9px' }}>No revenue data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="chart-container">
          <div className="chart-header" style={{ padding: '6px 8px 4px 8px', marginBottom: '0' }}>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '9px', fontWeight: '600', lineHeight: '1.2' }}>Sales by Category</h3>
          </div>
          <div style={{ height: '200px', marginTop: '0', padding: '0 4px 0 4px', overflow: 'visible' }}>
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCategoryLabel}
                    labelLine={false}
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: isDark ? '0 3px 8px rgba(0, 0, 0, 0.3)' : '0 3px 8px rgba(0, 0, 0, 0.1)',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '7px',
                      padding: '5px 7px'
                    }}
                    labelStyle={{
                      color: isDark ? '#cbd5e1' : '#475569',
                      fontSize: '7px',
                      fontWeight: '600',
                      marginBottom: '3px'
                    }}
                    itemStyle={{
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '7px'
                    }}
                    formatter={(value, name, props) => {
                      const payload = props.payload;
                      return [
                        formatAmount(value, 'INR'),
                        `${payload.name || name} (${payload.percentage?.toFixed(1) || 0}%)`
                      ];
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={18}
                    wrapperStyle={{ fontSize: '7px', paddingTop: '4px' }}
                    iconSize={6}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: '#94a3b8', fontSize: '7px' }}>No category sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '13px', marginBottom: '0' }}>
        {/* Customer Distribution */}
        <div className="chart-container">
          <div className="chart-header" style={{ padding: '6px 8px 4px 8px', marginBottom: '0' }}>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '9px', fontWeight: '600', lineHeight: '1.2' }}>Customer Distribution</h3>
          </div>
          <div style={{ height: '201px', marginTop: '0', padding: '0 4px 0 4px', overflow: 'visible' }}>
            {customerData && customerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    height={35}
                    angle={-45}
                    textAnchor="end"
                    dy={5}
                    interval={0}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '9px',
                      padding: '8px 11px'
                    }}
                    labelStyle={{
                      color: isDark ? '#cbd5e1' : '#475569',
                      fontSize: '8px',
                      fontWeight: '600',
                      marginBottom: '5px'
                    }}
                    itemStyle={{
                      color: isDark ? '#f1f5f9' : '#1e293b',
                      fontSize: '9px'
                    }}
                    formatter={(value) => [`Count: ${value} customers`, '']}
                  />
                  <Bar dataKey="value" fill="#FF8C00" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: '#94a3b8', fontSize: '9px' }}>No customer distribution data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="card" style={{ padding: '6px 8px', marginBottom: '0' }}>
          <div className="card-header" style={{ padding: '3px 0', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ fontSize: '6px', margin: '0', lineHeight: '1.2', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Top Performing Products
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/products'}
              style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '5px', padding: '2px 5px', lineHeight: '1.2', minHeight: '14px', fontWeight: '500' }}
            >
              <FiEye style={{ fontSize: '5px' }} />
              View All
            </button>
          </div>
          <div className="table-container" style={{ padding: '0', margin: '0', maxHeight: '280px', overflowY: 'auto' }}>
            <table className="table" style={{ margin: '0', borderSpacing: '0', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Product</th>
                  <th style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Sales</th>
                  <th style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Revenue</th>
                  <th style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topProductsData.map((product, index) => (
                  <tr key={product.id || index} style={{ lineHeight: '1.2' }}>
                    <td style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          background: isDark ? '#334155' : '#f1f5f9', 
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          flexShrink: 0
                        }}>
                          🌿
                        </div>
                        <span style={{ fontSize: '7px', lineHeight: '1.2' }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2' }}>{product.total_sold || 0}</td>
                    <td style={{ fontSize: '7px', padding: '2px 4px', lineHeight: '1.2' }}>{formatAmount(product.revenue || product.total_revenue || 0, 'INR')}</td>
                    <td style={{ padding: '2px 4px' }}>
                      <span className="stat-change positive" style={{ fontSize: '7px', display: 'flex', alignItems: 'center', gap: '3px', lineHeight: '1.2' }}>
                        <FiTrendingUp style={{ fontSize: '7px' }} />
                        {product.percentage ? `${product.percentage.toFixed(1)}%` : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
                {topProductsData.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3px', fontSize: '7px', lineHeight: '1.2', color: isDark ? '#94a3b8' : '#64748b' }}>
                      No product data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
