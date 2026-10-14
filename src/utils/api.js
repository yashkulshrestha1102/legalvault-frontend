// src/utils/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

// ═══════════════════════════════════════════
// ✅ Axios instance with interceptors
// ═══════════════════════════════════════════
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const uploadApi = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  withCredentials: true,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// ═══════════════════════════════════════════
// ✅ IN-MEMORY CACHE (60 sec TTL)
// ═══════════════════════════════════════════
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

// ═══════════════════════════════════════════
// ✅ REQUEST DEDUPLICATION
// Same URL parallel requests को merge करता है
// ═══════════════════════════════════════════
const pendingRequests = new Map();

// ═══════════════════════════════════════════
// ✅ REQUEST INTERCEPTOR
// ═══════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    // ✅ R2 URLs के लिए withCredentials: false
    if (url.includes('r2.dev') || url.includes('R2_PUBLIC_URL')) {
      config.withCredentials = false;
      delete config.headers.Authorization;
      return config;
    }

    // ✅ Legacy token support
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Request Deduplication (केवल GET requests के लिए)
    if (config.method === 'get' && !config.skipCache) {
      const key = `${url}:${JSON.stringify(config.params || {})}`;
      
      // अगर same request पहले से pending है, उसे cancel करो
      if (pendingRequests.has(key)) {
        pendingRequests.get(key).abort();
      }
      
      const controller = new AbortController();
      config.signal = controller.signal;
      pendingRequests.set(key, controller);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ═══════════════════════════════════════════
// ✅ RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════
api.interceptors.response.use(
  (response) => {
    const config = response.config;
    const url = config.url || '';

    // ✅ Clear pending request tracker
    if (config.method === 'get') {
      const key = `${url}:${JSON.stringify(config.params || {})}`;
      pendingRequests.delete(key);
    }

    // ✅ Cache GET responses (60 sec)
    if (config.method === 'get' && !config.skipCache) {
      const key = `${url}:${JSON.stringify(config.params || {})}`;
      cache.set(key, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // ✅ Invalidate cache on mutations
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      // जब कोई data change हो, तो उस related cache को clear करो
      const baseUrl = url.split('/').slice(0, 3).join('/');
      for (const key of cache.keys()) {
        if (key.startsWith(baseUrl)) {
          cache.delete(key);
        }
      }
    }

    return response;
  },

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // ✅ Clear pending request on error
    if (error.config?.method === 'get') {
      const key = `${url}:${JSON.stringify(error.config.params || {})}`;
      pendingRequests.delete(key);
    }

    // ✅ Selective 401 handling
    const isAuthEndpoint =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/logout') ||
      url.includes('/api/auth/me') ||
      url.includes('/api/auth/verify');

    if (status === 401 && isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════
// ✅ CUSTOM CACHED GET
// ═══════════════════════════════════════════
export const cachedGet = async (url, options = {}, ttl = CACHE_TTL) => {
  const key = `${url}:${JSON.stringify(options.params || {})}`;
  const cached = cache.get(key);

  // ✅ Return from cache if fresh
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`⚡ CACHE HIT: ${url}`);
    return { data: cached.data, fromCache: true };
  }

  // ✅ Fetch fresh
  console.log(`🌐 CACHE MISS: ${url}`);
  const response = await api.get(url, options);
  return { data: response.data, fromCache: false };
};

// ═══════════════════════════════════════════
// ✅ MANUAL CACHE INVALIDATION
// ═══════════════════════════════════════════
export const invalidateCache = (urlPattern = null) => {
  if (!urlPattern) {
    cache.clear();
    console.log('🗑️ Full cache cleared');
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
      console.log(`🗑️ Cache cleared: ${key}`);
    }
  }
};

// ═══════════════════════════════════════════
// ✅ CACHE STATS (Debugging के लिए)
// ═══════════════════════════════════════════
export const getCacheStats = () => {
  return {
    size: cache.size,
    pendingRequests: pendingRequests.size,
    entries: Array.from(cache.keys()),
  };
};

export { API_URL, uploadApi };
export default api;