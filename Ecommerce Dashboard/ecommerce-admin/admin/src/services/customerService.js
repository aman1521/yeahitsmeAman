import apiClient from './apiClient';

export const customerService = {
  getCustomers: async (params = {}) => {
    const response = await apiClient.get('/users/', { params });
    const users = response.data.users || response.data.customers || [];
    return {
      users,
      total: response.data.total || users.length,
      pages: response.data.pages || 1
    };
  },

  getPortfolioLeads: async () => {
    const response = await apiClient.get('/portfolio/leads');
    return response.data.leads || [];
  },

  updateCustomer: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id, isActive) => {
    const response = await apiClient.put(`/users/${id}/status`, { is_active: !isActive });
    return response.data;
  }
};

export default customerService;

