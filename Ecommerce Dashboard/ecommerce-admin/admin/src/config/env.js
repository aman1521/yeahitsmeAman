/**
 * Centralized Environment Configuration
 * Validates, normalizes, and exposes environment variables with safe fallbacks
 */

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // In browser on static host, use /api proxy/fallback
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return 'http://127.0.0.1:8800';
};

export const ENV = Object.freeze({
  API_BASE_URL: getApiBaseUrl(),
  CURRENCY_API_URL: process.env.REACT_APP_CURRENCY_API_URL || getApiBaseUrl(),
  PUBLIC_URL: process.env.PUBLIC_URL || '/ecommerce-dashboard',
  NODE_ENV: process.env.NODE_ENV || 'production',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_CURRENCY_SYMBOL: '₹',
  STORE_NAME: 'Peenakaa (RasayanaBio)',
  SUPPORT_EMAIL: 'support@rasayanabio.com',
  GA4_MEASUREMENT_ID: 'G-MZ23TJWG25',
  GTM_CONTAINER_ID: 'GTM-W7JH95Q'
});

export const authStorage = {
  getToken: () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
  setToken: (token) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userPayload');
    }
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const u = localStorage.getItem('userPayload');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPayload', JSON.stringify(user));
    }
  },
  isDemoMode: () => {
    if (typeof window === 'undefined') return true;
    const token = localStorage.getItem('token');
    return token === 'peenakaa-demo-token' || localStorage.getItem('demo_mode') === 'true';
  }
};

export default ENV;

