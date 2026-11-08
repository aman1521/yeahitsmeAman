import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { orderService } from '../services/orderService';

export const useDashboardStats = (period = '30', view = 'daily') => {
  const [stats, setStats] = useState({
    orders: { total: 0, change_percentage: 0 },
    sales: { total: 0, change_percentage: 0 },
    products: { total: 0, active: 0 },
    users: { total: 0, active: 0 }
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, salesData, topData, recentData] = await Promise.all([
        analyticsService.getDashboardStats({ days: period }),
        analyticsService.getSalesChart({ days: period, view }),
        analyticsService.getTopProducts({ limit: 5 }),
        orderService.getRecentOrders(5)
      ]);

      if (statsData) setStats(statsData);
      if (salesData) setChartData(salesData);
      if (topData) setTopProducts(topData);
      if (recentData) setRecentOrders(recentData);
    } catch (err) {
      console.error('[useDashboardStats] Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [period, view]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    chartData,
    topProducts,
    recentOrders,
    loading,
    refetch: loadData
  };
};

export default useDashboardStats;

