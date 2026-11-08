import apiClient from './apiClient';

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/', { params });
    return {
      orders: response.data.orders || [],
      total: response.data.total || response.data.orders?.length || 0,
      pages: response.data.pages || 1
    };
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order || response.data;
  },

  getRecentOrders: async (limit = 10) => {
    const response = await apiClient.get('/dashboard/recent-orders', { params: { limit } });
    return response.data.orders || [];
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default orderService;

