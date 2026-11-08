import apiClient from './apiClient';

export const analyticsService = {
  getDashboardStats: async (params = {}) => {
    const response = await apiClient.get('/dashboard/stats', { params });
    return response.data;
  },

  getSalesChart: async (params = {}) => {
    const response = await apiClient.get('/dashboard/sales-chart', { params });
    return response.data.chart_data || response.data.sales || [];
  },

  getTopProducts: async (params = {}) => {
    const response = await apiClient.get('/dashboard/top-products', { params });
    return response.data.products || [];
  },

  getRevenueReports: async () => {
    const response = await apiClient.get('/revenue/reports');
    return response.data;
  }
};

export default analyticsService;

