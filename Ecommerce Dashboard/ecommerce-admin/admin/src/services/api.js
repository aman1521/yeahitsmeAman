import axios from 'axios';
import toast from 'react-hot-toast';
import resolveApiBaseUrl from '../utils/resolveApiBaseUrl';

// Flask primary - DIRECT backend URL (bypassing proxy)
const api = axios.create({ baseURL: `${resolveApiBaseUrl()}/api` });

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      toast.error(`Endpoint not found: ${error.config?.url}`);
    } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      toast.error('Cannot connect to backend. Please verify the server is reachable.');
    }
    return Promise.reject(error);
  }
);

export default api;

