/**
 * Centralized API client for all backend calls
 * Uses proxy routing (/api -> backend service)
 */
import axios from 'axios';
import toast from 'react-hot-toast';
import resolveApiBaseUrl from '../utils/resolveApiBaseUrl';
import { getDemoResponse } from './demoMockData';

// Create centralized API client with proxy routing
// Use resolved URL if configured, or /api for relative/proxy connection
const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim() && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // In browser, use /api as baseURL so requests go through proxy or Netlify redirects
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return resolveApiBaseUrl();
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token automatically
apiClient.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Multi-tenancy removed - no site_id header needed

    if (typeof config.url === 'string' && !config.url.startsWith('http')) {
      let path = config.url.startsWith('/') ? config.url : `/${config.url}`;
      // Since baseURL is /api, we just need to ensure the path is correct
      // Remove leading /api if present to avoid duplication (baseURL already has /api)
      if (path.startsWith('/api/')) {
        path = path.substring(4); // Remove /api prefix since baseURL is /api
      } else if (path.startsWith('/api')) {
        path = path.substring(4);
      }
      // Ensure path starts with /
      if (!path.startsWith('/')) {
        path = `/${path}`;
      }
      config.url = path;
    }

    // Reduced logging for better performance - only log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Reduced logging for better performance
    if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const suppressErrorToast = error.config?.suppressErrorToast || false;
    
    // Check if in Demo Mode or if backend is unreachable / 404
    const isDemo = localStorage.getItem('token') === 'peenakaa-demo-token' || localStorage.getItem('demo_mode') === 'true';
    const isNetworkOr404 = !error.response || error.code === 'ERR_NETWORK' || status === 404;
    if ((isDemo || isNetworkOr404) && error.config?.method?.toLowerCase() === 'get') {
      const mock = getDemoResponse(url);
      if (mock && mock.data) {
        return Promise.resolve({
          data: mock.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }

    // Only log errors in development to reduce console noise
    if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${error.config?.method} ${url}`, status, error.response?.data || error.message);
    }
    
    // Normalize URL for comparison (remove trailing slashes and /api prefix)
    const normalizedUrl = url.replace(/\/api\//g, '/').replace(/\/$/, '').toLowerCase();
    
    // Debug logging for 401 errors
    if (status === 401 && process.env.NODE_ENV === 'development') {
      console.log('[apiClient] 401 error detected:', {
        url,
        normalizedUrl,
        method: error.config?.method,
        suppressErrorToast
      });
    }
    
    // Check if this is a login request - should never redirect or show session expired
    const isLoginRequest = normalizedUrl.includes('/auth/login') || normalizedUrl.includes('/api/auth/login');
    
    // Check if this is a background request that shouldn't trigger redirects
    const isBackgroundRequest = 
      (normalizedUrl.includes('/currencies') && error.config?.method === 'get') ||
      (normalizedUrl.includes('/products') && error.config?.method === 'get' && !normalizedUrl.includes('/products/')) ||
      (normalizedUrl.includes('/product-packs') && error.config?.method === 'get') ||
      normalizedUrl.includes('/pricing/recalculate') ||
      normalizedUrl.includes('/auth/profile') ||
      normalizedUrl.includes('/health-benefits') ||
      normalizedUrl.includes('/key-ingredients') ||
      // Test endpoints - don't redirect on these
      normalizedUrl.includes('/rewards-v2/test/') ||
      normalizedUrl.includes('/reward-stacking/test') ||
      normalizedUrl.includes('/rewards/campaigns') ||
      normalizedUrl.includes('/coupons') ||
      // Don't redirect on reset password page - allow it to work without auth
      (window.location.pathname === '/reset-password') ||
      suppressErrorToast; // If explicitly suppressed, treat as background
    
    // Debug logging for background request detection
    if (status === 401 && process.env.NODE_ENV === 'development') {
      console.log('[apiClient] Background request check:', {
        isBackgroundRequest,
        willRedirect: !isBackgroundRequest && !isLoginRequest
      });
    }
    
    // For background requests or suppressed errors, just reject without showing toasts or redirecting
    // This prevents losing form data when background requests fail (including 401 errors)
    if (isBackgroundRequest) {
      return Promise.reject(error);
    }
    
        // Only show errors for critical failures or user-initiated actions
        if (status === 404) {
          toast.error(`Endpoint not found: ${url}`);
        } else if (status === 401) {
          // Check if this is a session expiration (not just auth failure)
          const sessionExpired = error.response?.data?.session_expired === true || 
                                 error.response?.data?.session_expired === 'true' ||
                                 error.response?.data?.error?.toLowerCase().includes('session expired') ||
                                 error.response?.data?.error?.toLowerCase().includes('session has been terminated');
          
          // Don't treat login endpoint 401 as session expiration
          // Login failures should be handled by AuthContext.login()
          if (isLoginRequest) {
            // Let the login handler show the error message
            // Don't show "session expired" or redirect - just reject the promise
            return Promise.reject(error);
          } else {
            // If suppressErrorToast is set, don't show toast or redirect
            // This is useful for background fetches that might fail
            if (suppressErrorToast && !sessionExpired) {
              return Promise.reject(error);
            }
            
            // If session expired, always redirect to login (even if suppressErrorToast is set)
            if (sessionExpired) {
              toast.error(error.response?.data?.error || 'Session expired. Please login again.');
              localStorage.removeItem('token');
              localStorage.removeItem('sessionId');
              // Small delay to ensure toast is visible
              setTimeout(() => {
                window.location.href = '/login';
              }, 500);
              return Promise.reject(error);
            }
            
            // Only redirect for non-login 401 errors (actual session expiration)
            // BUT: Check if we're on a form page - if so, don't redirect immediately
            // Instead, show a warning and let user save their work
            const isFormPage = window.location.pathname.includes('/add') || 
                              window.location.pathname.includes('/edit');
            
            if (isFormPage) {
              // On form pages, show warning but don't redirect immediately
              toast.error('Session expired. Please save your work and login again.', { 
                duration: 8000 
              });
              // Don't redirect - let user continue working
              return Promise.reject(error);
            } else {
              // On other pages, redirect normally
              toast.error('Session expired. Please login again.');
              localStorage.removeItem('token');
              localStorage.removeItem('sessionId');
              window.location.href = '/login';
            }
          }
        } else if (status === 423) {
      // Account locked - handled in AuthContext, don't show duplicate toast here
      // The error message will be shown by AuthContext.login()
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      toast.error('Cannot connect to backend. Please verify the server is reachable.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

