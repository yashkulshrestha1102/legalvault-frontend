// src/utils/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// ✅ Axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,  // ✅ CRITICAL: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor - Legacy token support (but cookies are primary)
api.interceptors.request.use(
  (config) => {
    // ✅ Cookie automatically sent via withCredentials
    // Legacy: check localStorage as fallback (for backwards compat)
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - Auto-handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login (only if not already there)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default api;