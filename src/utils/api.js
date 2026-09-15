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


const uploadApi = axios.create({
  baseURL: API_URL,
  timeout: 600000,  // 10 min
  withCredentials: true,
  maxContentLength: Infinity,      // ✅ No limit
  maxBodyLength: Infinity,         // ✅ No limit
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

// ✅ Response interceptor - Selective 401 handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // ✅ ONLY logout on AUTH endpoints (login/session check)
    const isAuthEndpoint =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/logout') ||
      url.includes('/api/auth/me') ||
      url.includes('/api/auth/verify');

    if (status === 401 && isAuthEndpoint) {
      // Real session expiry — logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // ✅ For all other 401s (documents, pdfs, clients, etc.)
    // → Just reject, do NOT logout
    // → UI can show a friendly error

    return Promise.reject(error);
  }
);

export { API_URL };
export default api;