/**
 * API Configuration
 * Central configuration for all API calls
 */

import resolveApiBaseUrl from '../utils/resolveApiBaseUrl';

// Backend base URL
export const API_HOST = resolveApiBaseUrl();
export const API_BASE_URL = `${API_HOST}/api`;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  SALES_CHART: `${API_BASE_URL}/dashboard/sales-chart`,
  TOP_PRODUCTS: `${API_BASE_URL}/dashboard/top-products`,
  RECENT_ORDERS: `${API_BASE_URL}/dashboard/recent-orders`,
  SALES_BY_CATEGORY: `${API_BASE_URL}/dashboard/sales-by-category`,
  CUSTOMER_DISTRIBUTION: `${API_BASE_URL}/dashboard/customer-distribution`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/products`,
  PRODUCT_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  
  // Currencies
  CURRENCIES: `${API_BASE_URL}/currencies`,
  CURRENCIES_PUBLIC: `${API_BASE_URL}/currencies-public`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/categories`,
  
  // Coupons
  COUPONS: `${API_BASE_URL}/coupons`,
  
  // Analytics
  TRACK_SESSION: `${API_BASE_URL}/analytics/track-session`,
  TRACK_PAGE_VIEW: `${API_BASE_URL}/analytics/track-page-view`,
};

// Helper function to build URL with query params
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export default API_BASE_URL;
