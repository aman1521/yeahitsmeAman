import axios from 'axios';
import toast from 'react-hot-toast';
import resolveApiBaseUrl from '../utils/resolveApiBaseUrl';

const api = axios.create({ baseURL: resolveApiBaseUrl() });

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status, response.data);
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const suppressErrorToast = error.config?.suppressErrorToast || false;
    
    console.error(`❌ API Error: ${error.config?.method} ${url}`, status, error.response?.data || error.message);
    
    // Don't show toast if error handling is suppressed
    if (suppressErrorToast) {
      return Promise.reject(error);
    }
    
    // Suppress errors for background/automatic requests
    // These are often fallback attempts that will retry with different endpoints
    const isBackgroundRequest = 
      (url.includes('/currencies') && error.config?.method === 'get') ||
      (url.includes('/products') && error.config?.method === 'get') ||
      url.includes('/pricing/recalculate') ||
      url.includes('/auth/profile');
    
    // Only show errors for user-initiated actions, not background requests
    if (!isBackgroundRequest) {
      if (status === 404) {
        toast.error(`Endpoint not found: ${url}`);
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to backend. Please verify the server is reachable.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    }
    
    return Promise.reject(error);
  }
);

export async function getCurrencies(includeInactive = false) {
  const token = localStorage.getItem('token');
  const params = {};
  if (includeInactive) {
    params.include_inactive = 'true';
  }
  // Suppress error toasts for fallback attempts - these are expected to fail sometimes
  const baseConfig = { suppressErrorToast: true };
  const config = token 
    ? { ...baseConfig, headers: { Authorization: `Bearer ${token}` }, params } 
    : { ...baseConfig, params };
  let res;
  try {
    // try authenticated canonical endpoint first (requires trailing slash in this backend)
    res = await api.get('/api/currencies/', config);
  } catch (_) {
    try {
      res = await api.get('/api/currencies-public/', config);
    } catch (__){
      // manage alias
      try {
        res = await api.get('/api/manage/currencies/', config);
      } catch (___) {
        res = await api.get('/api/currencies', config); // last resort
      }
    }
  }
  const adapted = (res.data?.currencies || []).map((c) => ({
    country_name: c.currency_name || c.currency_code,
    currency_code: c.currency_code,
    symbol: c.currency_symbol || c.currency_code,
    is_active: c.is_active !== false,
    exchange_rate: Number(c.exchange_rate ?? c.rate ?? 1),
    api_rate: Number(c.api_rate ?? c.exchange_rate ?? c.rate ?? 1),
    adjustment_factor: Number(c.adjustment_factor ?? c.custom_value_factor ?? 1),
    rate_against_inr: Number(c.exchange_rate ?? c.rate ?? 1),
    custom_value_factor: Number(c.adjustment_factor ?? c.custom_value_factor ?? 1),
    custom_percentage_change: Number(c.custom_percentage_change ?? 0),
    regional_tax_percent: Number(c.regional_tax_percent ?? 0),
    is_base_currency: c.is_base_currency,
    last_updated: c.last_updated,
  }));
  return { data: { data: adapted } };
}

export async function getProducts(code) {
  const params = code ? { currency: code } : {};
  const config = { params, suppressErrorToast: true }; // Suppress errors for background requests
  try {
    return await api.get('/api/products/', config);
  } catch (e) {
    // Fallback without trailing slash
    return await api.get('/api/products', config);
  }
}

export async function convertBatch(currencyCode, items) {
  const product_ids = items.map(i => i.id);
  try {
    // Flask unified batch endpoint
    const payload = { currency: currencyCode, items: items.map(i => ({ id: i.id, base_price_in_inr: Number(i.baseInInr ?? i.regular_price ?? i.base_price ?? 0) })) };
    return await api.post('/api/convert-price', payload);
  } catch (e2) {
    try {
      // Legacy fallback if present
      return await api.post('/api/currencies/convert-batch', { currency: currencyCode, product_ids });
    } catch (e3) {
      const results = [];
      for (const id of product_ids) {
        try {
          const r = await api.get('/api/currency-v2/convert-product', { params: { product_id: id, currency: currencyCode } });
          results.push({ product_id: id, ...r.data });
        } catch (_) {}
      }
      return { data: { currency: currencyCode, items: results } };
    }
  }
}

export async function listV2Currencies() {
  try {
    // Try with trailing slash first
    return await api.get('/api/currency-v2/currencies/');
  } catch (e) {
    try {
      // Fallback to manage/currencies if v2 doesn't exist
      return await api.get('/api/manage/currencies/');
    } catch (e2) {
      // Last resort: use public currencies
      return await getCurrencies();
    }
  }
}

export default api;

