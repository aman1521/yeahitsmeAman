import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiDollarSign, 
  FiUsers, 
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiDatabase,
  FiArrowRight
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useGlobalCurrency } from '../contexts/GlobalCurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import AIGrowthBriefing from '../components/AIGrowthBriefing';
import PortfolioTrafficView from '../components/PortfolioTrafficView';
import { REAL_PORTFOLIO_LEADS, exportLeadsAsCSV, downloadDatabaseFile } from '../services/customerService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user, isDemoMode, isPersonalAdmin } = useAuth();
  const isActuallyPersonalAdmin = Boolean(isPersonalAdmin || (!isDemoMode && user && (user.email === 'amanchouhan1217@gmail.com' || user.username === 'amanchouhan1217@gmail.com')));
  const { formatAmount, selectedCurrency, currencySymbol } = useGlobalCurrency();
  // activeSiteId and siteVersion removed - multi-tenancy removed
  const [stats, setStats] = useState({
    orders: { total: 0, last_month: 0, last_week: 0, change_percentage: 0 },
    sales: { total: 0, last_month: 0, last_week: 0, change_percentage: 0 },
    products: { total: 0, active: 0, featured: 0 },
    users: { total: 0, active: 0 },
    recent_reviews: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [salesChartPeriod, setSalesChartPeriod] = useState('30'); // days
  const [salesChartView, setSalesChartView] = useState('daily'); // daily, weekly, monthly
  const [rangeMode, setRangeMode] = useState('preset');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [rangeMeta, setRangeMeta] = useState(null);

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
        orders: dataMap.has(dateStr) ? dataMap.get(dateStr).orders : 0,
        products_sold: dataMap.has(dateStr) ? dataMap.get(dateStr).products_sold || 0 : 0,
        customers: dataMap.has(dateStr) ? dataMap.get(dateStr).customers || 0 : 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filledData;
  };

  useEffect(() => {
    // Skip if custom range is selected but dates are not set
    if (rangeMode === 'custom' && (!customRange.start || !customRange.end)) {
      return;
    }
    fetchDashboardData();
  }, [salesChartPeriod, salesChartView, rangeMode, customRange.start, customRange.end]);

  useEffect(() => {
    if (rangeMode === 'custom' && rangeMeta?.range) {
      setCustomRange((prev) => ({
        start: prev.start || rangeMeta.range.start_date,
        end: prev.end || rangeMeta.range.end_date
      }));
    }
  }, [rangeMode, rangeMeta]);

  // Inject CSS to override global font scaling for Dashboard Recent Orders section and Chart Titles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Override font scaling for Dashboard Recent Orders card header - Force 6px */
        .dashboard-page .card-header .card-title[style*="fontSize: '6px'"],
        .dashboard-page .card-header .card-title[style*='fontSize: "6px"'],
        .dashboard-page .card-header .card-title[style*="fontSize: 6px"],
        .dashboard-page .card-header h3[style*="fontSize: '6px'"],
        .dashboard-page .card-header h3[style*='fontSize: "6px"'],
        .dashboard-page .card-header h3[style*="fontSize: 6px"],
        .dashboard-page .card .card-header .card-title[style*="fontSize: '6px'"],
        .dashboard-page .card .card-header .card-title[style*='fontSize: "6px"'],
        .dashboard-page .card .card-header .card-title[style*="fontSize: 6px"],
        .dashboard-page .card .card-header h3[style*="fontSize: '6px'"],
        .dashboard-page .card .card-header h3[style*='fontSize: "6px"'],
        .dashboard-page .card .card-header h3[style*="fontSize: 6px"],
        .dashboard-page h3.card-title[style*="fontSize: '6px'"],
        .dashboard-page h3.card-title[style*='fontSize: "6px"'],
        .dashboard-page h3.card-title[style*="fontSize: 6px"],
        .dashboard-page div.card-header h3.card-title[style*="fontSize: '6px'"],
        .dashboard-page div.card-header h3.card-title[style*='fontSize: "6px"'],
        .dashboard-page div.card-header h3.card-title[style*="fontSize: 6px"] {
          font-size: 6px !important;
          line-height: 1.2 !important;
        }
        /* Override font scaling for Dashboard Recent Orders table headers - Force 5px */
        .dashboard-page .table-container table th[style*="fontSize: '5px'"],
        .dashboard-page .table-container table th[style*='fontSize: "5px"'],
        .dashboard-page .table-container table th[style*="fontSize: 5px"] {
          font-size: 5px !important;
        }
        /* Override font scaling for Dashboard Recent Orders table cells - Force 6px */
        .table-container table td[style*="fontSize: '6px'"],
        .table-container table td[style*='fontSize: "6px"'],
        .table-container table td[style*="fontSize: 6px"] {
          font-size: 6px !important;
        }
        /* Override font scaling for status badges - Force 5px */
        .table-container .status-badge[style*="fontSize: '5px'"],
        .table-container .status-badge[style*='fontSize: "5px"'],
        .table-container .status-badge[style*="fontSize: 5px"] {
          font-size: 5px !important;
        }
        /* Override font scaling for table buttons - Force 6px */
        .table-container button[style*="fontSize: '6px'"],
        .table-container button[style*='fontSize: "6px"'],
        .table-container button[style*="fontSize: 6px"] {
          font-size: 6px !important;
        }
        /* Override font scaling for Chart Titles */
        .chart-title,
        h3.chart-title,
        .chart-container .chart-title,
        .chart-container h3.chart-title {
          font-size: 9px !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          margin: 0 !important;
        }
        .chart-title[style*="fontSize: '9px'"],
        .chart-title[style*='fontSize: "9px"'],
        .chart-title[style*="fontSize: 9px"] {
          font-size: 9px !important;
        }
      `;
      style.id = 'dashboard-recent-orders-overrides-styles';
      if (!document.getElementById('dashboard-recent-orders-overrides-styles')) {
        document.head.appendChild(style);
      }
      return () => {
        const existingStyle = document.getElementById('dashboard-recent-orders-overrides-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const isCustom = rangeMode === 'custom';
      const presetDays = parseInt(salesChartPeriod, 10);

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
        ? { start_date: startIso, end_date: endIso, view: salesChartView }
        : { days: presetDays, view: salesChartView };

      // Optimize: Fetch critical data first, then load rest
      setLoading(true);
      
      // Fetch stats first (most important)
      const statsResponse = await apiClient.get('/dashboard/stats', { params: baseParams });
      
      if (statsResponse.data) {
        const statsData = { ...statsResponse.data };
        if (!statsData.orders) statsData.orders = { total: 0, change_percentage: 0 };
        if (!statsData.sales) statsData.sales = { total: 0, change_percentage: 0 };
        if (!statsData.products) statsData.products = { total: 0, active: 0 };
        if (!statsData.users) {
          statsData.users = { total: 0, active: 0 };
        } else if (typeof statsData.users === 'number') {
          statsData.users = { total: statsData.users, active: statsData.users };
        } else if (statsData.users && typeof statsData.users === 'object') {
          if (typeof statsData.users.total === 'undefined') {
            statsData.users.total = statsData.users.lifetime_total || statsData.users.active || 0;
          }
          if (typeof statsData.users.active === 'undefined') {
            statsData.users.active = statsData.users.total || 0;
          }
        }
        setStats(statsData);
        setLoading(false); // Show stats immediately
      }
      
      // Fetch charts and products in parallel (less critical)
      const [chartResponse, productsResponse] = await Promise.all([
        apiClient.get('/dashboard/sales-chart', { params: chartParams }),
        apiClient.get('/dashboard/top-products', { params: { limit: 10, ...baseParams } })
      ]);
      
      // Fetch recent orders separately (lowest priority)
      let ordersResponse;
      try {
        setOrdersLoading(true);
        ordersResponse = await apiClient.get('/dashboard/recent-orders', { params: { limit: 10 } });
      } catch (err) {
        console.error('Error fetching recent orders:', err);
        ordersResponse = { data: { orders: [] } };
      } finally {
        setOrdersLoading(false);
      }

      setRangeMeta(statsResponse.data?.meta || chartResponse.data?.meta || null);
      if (chartResponse.data && chartResponse.data.chart_data) {
        const rawData = chartResponse.data.chart_data;
        const filledData = fillMissingDates(rawData, startDateObj, endDateObj);
        
        let processedData = filledData;
        
        if (salesChartView === 'weekly' && processedData.length > 0) {
          processedData = groupDataByWeek(processedData);
        } else if (salesChartView === 'monthly' && processedData.length > 0) {
          processedData = groupDataByMonth(processedData);
        }
        
        setChartData(processedData);
      } else {
        const emptyData = fillMissingDates([], startDateObj, endDateObj);
        setChartData(emptyData);
      }
      if (productsResponse.data && productsResponse.data.products) {
        setTopProducts(productsResponse.data.products);
      } else {
        setTopProducts([]);
      }
      
      // Handle recent orders - try multiple response structures
      if (ordersResponse && ordersResponse.data) {
        const orders = ordersResponse.data.orders || ordersResponse.data.data?.orders || [];
        console.log('Recent orders fetched:', orders.length, orders);
        setRecentOrders(Array.isArray(orders) ? orders : []);
      } else {
        console.warn('No orders data in response:', ordersResponse);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      
      // Set default values on error to prevent display issues
      setStats({
        orders: { total: 0, last_month: 0, last_week: 0, change_percentage: 0 },
        sales: { total: 0, last_month: 0, last_week: 0, change_percentage: 0 },
        products: { total: 0, active: 0, featured: 0 },
        users: { total: 0, active: 0 },
        recent_reviews: 0
      });
      setChartData([]);
      setTopProducts([]);
      setRecentOrders([]);
      
      toast.error('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Group data by week
  const groupDataByWeek = (data) => {
    const weeks = {};
    data.forEach(item => {
      const date = new Date(item.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          date: weekKey,
          sales: 0,
          orders: 0,
          products_sold: 0  // ADD THIS!
        };
      }
      weeks[weekKey].sales += item.sales || 0;
      weeks[weekKey].orders += item.orders || 0;
      weeks[weekKey].products_sold += item.products_sold || 0;  // ADD THIS!
    });
    return Object.values(weeks).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Group data by month
  const groupDataByMonth = (data) => {
    const months = {};
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          date: monthKey,
          sales: 0,
          orders: 0,
          products_sold: 0  // ADD THIS!
        };
      }
      months[monthKey].sales += item.sales || 0;
      months[monthKey].orders += item.orders || 0;
      months[monthKey].products_sold += item.products_sold || 0;  // ADD THIS!
    });
    return Object.values(months).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '201px' }}>
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Orders',
      value: stats?.orders?.total || 0,
      change: stats?.orders?.change_percentage || 0,
      icon: FiShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Sales',
      value: formatAmount(stats?.sales?.total || 0, 'INR'),
      change: stats?.sales?.change_percentage || 0,
      icon: FiDollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Products',
      value: stats?.products?.total || 0,
      change: 0,
      icon: FiStar,
      color: 'bg-purple-500'
    },
    {
      title: 'Users',
      value: typeof stats?.users === 'object' ? (stats?.users?.total ?? stats?.users?.lifetime_total ?? 0) : (typeof stats?.users === 'number' ? stats?.users : 0),
      change: 0,
      icon: FiUsers,
      color: 'bg-orange-500'
    }
  ];

  const rangeLabel = rangeMode === 'preset'
    ? `Last ${salesChartPeriod} days`
    : 'Custom Range';

  const msPerDay = 1000 * 60 * 60 * 24;
  const computedCustomSpan = () => {
    const startObj = parseInputDate(customRange.start);
    const endObj = parseInputDate(customRange.end);
    if (!startObj || !endObj) return parseInt(salesChartPeriod, 10);
    return Math.max(Math.floor((endObj - startObj) / msPerDay) + 1, 1);
  };

  const chartSpanDays = rangeMeta?.range?.days ?? (rangeMode === 'custom' && customRange.start && customRange.end
    ? computedCustomSpan()
    : parseInt(salesChartPeriod, 10));

  if (isActuallyPersonalAdmin) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* GA4 Real Live Traffic Intelligence */}
        <PortfolioTrafficView />

        {/* Real Client Inquiries Table from leads.db */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                  Recent Client Inquiries &amp; Consultations
                </h3>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#ECFDF5', color: '#065F46', fontWeight: '600' }}>
                  Live SQLite leads.db
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                Verified inquiries received via your portfolio contact forms &amp; booking channels
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={downloadDatabaseFile}
                title="Download SQLite database file (leads.db)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: '#0F828A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(15, 130, 138, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <FiDatabase size={13} />
                <span>Download DB (.db)</span>
              </button>
              <button
                type="button"
                onClick={() => exportLeadsAsCSV()}
                title="Export inquiries to CSV"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: '#168CD6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 140, 214, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                <FiDownload size={13} />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/users')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'rgba(22, 140, 214, 0.08)',
                  color: '#168CD6',
                  border: '1px solid rgba(22, 140, 214, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>View All Inquiries</span>
                <FiArrowRight size={13} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Client / Company</th>
                  <th style={{ padding: '10px 12px' }}>Email</th>
                  <th style={{ padding: '10px 12px' }}>Phone</th>
                  <th style={{ padding: '10px 12px' }}>Project Scope</th>
                  <th style={{ padding: '10px 12px' }}>Source / Dept</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {REAL_PORTFOLIO_LEADS.slice(0, 5).map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#0F172A' }}>{lead.name}</td>
                    <td style={{ padding: '12px' }}>
                      <a href={`mailto:${lead.email}`} style={{ color: '#168CD6', textDecoration: 'none' }}>{lead.email}</a>
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>{lead.phone}</td>
                    <td style={{ padding: '12px', color: '#0F172A', fontWeight: '500' }}>{lead.url}</td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{lead.role}</td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{lead.timestamp.split(' ')[0]}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: lead.status === 'High Priority' ? '#FEF2F2' : '#F0FDF4',
                        color: lead.status === 'High Priority' ? '#DC2626' : '#16A34A',
                        border: `1px solid ${lead.status === 'High Priority' ? '#FCA5A5' : '#BBF7D0'}`
                      }}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Functional AI Growth Diagnostic Copilot */}
      <AIGrowthBriefing
        onNavigateToProducts={() => navigate('/products')}
        onNavigateToCoupons={() => navigate('/coupons')}
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
            <div className="stat-value">
              {typeof stat.value === 'number' 
                ? stat.value 
                : (typeof stat.value === 'string' && stat.value !== 'null' && stat.value !== 'undefined')
                  ? stat.value
                  : '0'}
            </div>
            <div className={`stat-change ${stat.change >= 0 ? 'positive' : 'negative'}`}>
              {stat.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            Vs previous period {Math.abs(stat.change)}%
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '9px', marginBottom: '12px' }}>
        {/* Sales Chart */}
        <div className="chart-container">
          <div className="chart-header" style={{ padding: '6px 8px 4px 8px', marginBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="chart-title" style={{ margin: 0, fontSize: '9px', fontWeight: '600', lineHeight: '1.2' }}>
                Sales Revenue Trend
              </h3>
              <div style={{ fontSize: '7px', color: isDark ? '#8b949e' : '#94a3b8', fontWeight: '500', lineHeight: '1.2' }}>
                {rangeLabel}
              </div>
            </div>
            <div className="chart-controls" style={{ marginTop: '4px' }}>
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
                  value={salesChartPeriod}
                  onChange={(e) => setSalesChartPeriod(e.target.value)}
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
                <FiFilter style={{ fontSize: '9px', color: isDark ? '#fb923c' : '#64748b' }} />
                <select 
                  className="form-select" 
                  style={{ width: '80px' }}
                  value={salesChartView}
                  onChange={(e) => setSalesChartView(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ height: '201px', marginTop: '0', padding: '0 4px 0 4px', overflow: 'visible' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d3142' : '#e2e8f0'} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    const period = chartSpanDays;
                    
                    if (period <= 14) {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else if (period <= 60) {
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else {
                      if (period >= 180) {
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      } else {
                        return date.toLocaleDateString('en-US', { month: 'short' });
                      }
                    }
                  }}
                  interval={Math.floor(chartData.length / 8)}
                  height={50}
                  angle={-45}
                  textAnchor="end"
                  dy={8}
                />
                <YAxis 
                  tick={{ fontSize: 8, fill: isDark ? '#9aa0a6' : '#64748b' }}
                  tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                  label={{ value: `Revenue (${currencySymbol})`, angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: isDark ? '#9aa0a6' : '#475569' } }}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1a1d29' : '#ffffff',
                    border: isDark ? '1px solid #2d3142' : '1px solid #e2e8f0',
                    borderRadius: '5px',
                    boxShadow: isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0, 0, 0, 0.1)',
                    fontSize: '9px',
                    padding: '8px 11px',
                    color: isDark ? '#e8eaed' : '#1e293b'
                  }}
                  labelStyle={{
                    color: isDark ? '#e8eaed' : '#1e293b',
                    fontSize: '8px',
                    fontWeight: '600',
                    marginBottom: '5px'
                  }}
                  itemStyle={{
                    color: isDark ? '#fb923c' : '#f97316',
                    fontSize: '9px',
                    fontWeight: '600'
                  }}
                  formatter={(value) => [formatAmount(value, 'INR'), 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  })}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '9px', paddingTop: '7px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Sales Revenue"
                  dot={{ fill: '#f97316', r: 3 }}
                  activeDot={{ r: 4, fill: '#ea580c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products Sold Chart */}
        <div className="chart-container">
          <div className="chart-header" style={{ padding: '6px 8px 4px 8px', marginBottom: '0' }}>
            <h3 className="chart-title" style={{ margin: 0, fontSize: '9px', fontWeight: '600', lineHeight: '1.2' }}>
              <FiStar style={{ display: 'inline', marginRight: '4px', fontSize: '8px' }} />
              Products Sold
            </h3>
          </div>
          <div style={{ marginBottom: '6px', paddingTop: '2px', paddingLeft: '8px', paddingRight: '8px' }}>
            {(() => {
              // Use all chartData - it already contains data for the selected period
              const totalProducts = chartData.reduce((sum, item) => sum + (item.products_sold || 0), 0);
              
              return (
                <>
                  <div style={{ fontSize: '9px', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {totalProducts} Units
                  </div>
                  <div style={{ fontSize: '9px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '3px' }}>
                    {rangeLabel || `Last ${salesChartPeriod} Days (Real Data)`}
                  </div>
                </>
              );
            })()}
          </div>
          <div style={{ height: '201px', marginTop: '0', padding: '0 4px 0 4px', overflow: 'visible' }}>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  // Use all chartData - it already contains data for the selected period
                  const sortedData = [...chartData].sort((a, b) => new Date(a.date) - new Date(b.date));
                  
                  return sortedData.map(item => {
                    const date = new Date(item.date);
                    const products = item.products_sold || 0; // REAL data from database!
                    
                    return {
                      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      products: products,
                      fullDate: item.date
                    };
                  });
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(148, 163, 184, 0.2)' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    height={50}
                    angle={-45}
                    textAnchor="end"
                    dy={8}
                  />
                  <YAxis 
                    tick={{ fontSize: 8, fill: isDark ? '#cbd5e1' : '#64748b' }}
                    width={50}
                    label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: isDark ? '#cbd5e1' : '#475569' } }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid #e2e8f0',
                      borderRadius: '5px',
                      boxShadow: isDark ? '0 3px 8px rgba(0,0,0,0.5)' : '0 3px 8px rgba(0, 0, 0, 0.1)',
                      fontSize: '9px',
                      padding: '8px 11px',
                      color: isDark ? '#e2e8f0' : '#1e293b'
                    }}
                    labelStyle={{
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      fontSize: '8px',
                      fontWeight: '600',
                      marginBottom: '5px'
                    }}
                    itemStyle={{
                      color: isDark ? '#168CD6' : '#f97316',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}
                    formatter={(value, name, props) => [`${value} Units`, 'Products Sold']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.date;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="products" 
                    fill="#f97316" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={34}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? '#94a3b8' : '#64748b', fontSize: '9px' }}>
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ padding: '6px 8px', marginBottom: '0' }}>
        <div className="card-header" style={{ padding: '3px 0', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title" style={{ fontSize: '6px', margin: '0', lineHeight: '1.2', fontWeight: '600', color: isDark ? '#e2e8f0' : '#1e293b' }}>
            <FiShoppingCart style={{ display: 'inline', marginRight: '2px', fontSize: '4px' }} />
            Recent Orders
            <span style={{ 
              marginLeft: '3px',
              fontSize: '4px',
              fontWeight: '400', 
              color: isDark ? '#94a3b8' : '#64748b' 
            }}>
              (Latest 10)
            </span>
          </h3>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '6px', padding: '2px 5px', lineHeight: '1.2', minHeight: '16px', fontWeight: '500' }}
          >
            View All
          </button>
        </div>
        <div className="table-container" style={{ padding: '0', margin: '0', maxHeight: '280px', overflowY: 'auto' }}>
          <table className="table" style={{ margin: '0', borderSpacing: '0', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Order No</th>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Customer</th>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Date</th>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Total</th>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Status</th>
                <th style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', padding: '3px', fontSize: '6px', lineHeight: '1.2' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : recentOrders && recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.id || order.order_number} style={{ lineHeight: '1.2' }}>
                    <td style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2' }}>#{order.order_number || order.id}</td>
                    <td style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2' }}>{order.user?.full_name || order.customer_name || 'Unknown Customer'}</td>
                    <td style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2' }}>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric'
                    }) : 'N/A'}</td>
                    <td style={{ fontSize: '6px', padding: '2px 4px', lineHeight: '1.2' }}>{formatAmount(order.total_amount || 0, 'INR')}</td>
                    <td style={{ padding: '2px 4px' }}>
                      <span className={`status-badge ${
                        order.status === 'delivered' ? 'status-active' :
                        order.status === 'processing' ? 'status-processing' :
                        order.status === 'pending' ? 'status-pending' :
                        'status-inactive'
                      }`} style={{ fontSize: '5px', padding: '1px 3px', lineHeight: '1.2' }}>
                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '2px 4px' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '1px 3px', fontSize: '6px', lineHeight: '1.2', minHeight: '14px' }}
                        onClick={() => navigate(`/orders`)}
                        title="View order details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b', padding: '3px', fontSize: '6px', lineHeight: '1.2' }}>
                    {loading ? 'Loading...' : 'No recent orders found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
