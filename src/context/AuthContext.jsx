// src/context/AuthContext.jsx
import { createContext, useState, useContext } from 'react';
import api from '../utils/api';

// ✅ STEP 1: Context CREATE karo
const AuthContext = createContext();

// ═══════════════════════════════════════════
// ✅ Helper: Extract error message from various formats
// ═══════════════════════════════════════════
const extractErrorMessage = (error) => {
  // Express-validator format: { errors: [{ msg: "..." }, ...] }
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map(e => e.msg || e.message).join(', ');
  }
  // Simple format: { message: "..." }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // Network/timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timeout. Please try again.';
  }
  if (error.message === 'Network Error') {
    return 'Cannot reach server. Check your connection.';
  }
  return error.message || 'Something went wrong';
};

// ═══════════════════════════════════════════
// ✅ STEP 2: Provider Component
// ═══════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      // ✅ Handle corrupt values
      if (!savedUser || savedUser === 'undefined' || savedUser === 'null') {
        return null;
      }
      return JSON.parse(savedUser);
    } catch (err) {
      console.error('Failed to parse user from localStorage:', err);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ═══════════════════════════════════════════
  // ✅ LOGIN — Fully robust
  // ═══════════════════════════════════════════
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Frontend validation
      if (!email || !password) {
        const msg = 'Email and password are required';
        setError(msg);
        return { success: false, error: msg };
      }

      const response = await api.post('/api/auth/login', { email, password });

      // ✅ CRITICAL FIX: Validate response structure before using
      const userData = response.data?.user;

      if (!userData || !userData.id) {
        console.error('Invalid login response:', response.data);
        const msg = 'Invalid response from server. Please try again.';
        setError(msg);
        return { success: false, error: msg };
      }

      // ✅ Safe to save
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };

    } catch (err) {
      const message = extractErrorMessage(err);
      console.error('❌ Login error:', message);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // ✅ LOGOUT — Always clears local state
  // ═══════════════════════════════════════════
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // Backend fail ho toh bhi local clear karo
      console.warn('Backend logout failed (clearing local anyway):', err.message);
    } finally {
      // ✅ ALWAYS clear local state
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  // ═══════════════════════════════════════════
  // ✅ REFRESH USER — For permission updates
  // ═══════════════════════════════════════════
  const refreshUser = async () => {
    try {
      // Try to fetch fresh user data from backend
      const response = await api.get('/api/auth/me');
      const userData = response.data?.user;

      if (userData && userData.id) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      // /api/auth/me not implemented → fallback to current user
      console.warn('Failed to refresh user:', err.message);
      return user;
    }
  };

  // ═══════════════════════════════════════════
  // ✅ CLEAR ERROR — Utility for UI
  // ═══════════════════════════════════════════
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ STEP 3: Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ STEP 4: Default Export
export default AuthContext;