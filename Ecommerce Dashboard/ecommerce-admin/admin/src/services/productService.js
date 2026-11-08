import apiClient from './apiClient';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products/', { params });
    return {
      products: response.data.products || [],
      total: response.data.total || response.data.products?.length || 0,
      pages: response.data.pages || 1
    };
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product || response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data.categories || [];
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/products/', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;

