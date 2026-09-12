// src/context/AuthContext.jsx
import { createContext, useState, useContext } from 'react';
import api from '../utils/api';

// ✅ STEP 1: Context CREATE karo (YEH LINE MISSING THI)
const AuthContext = createContext();

// ✅ STEP 2: Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user } = response.data;
      
      // ✅ Only store user, NOT token (token is in HTTP-only cookie)
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ STEP 3: Custom Hook (Optional)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ STEP 4: Default Export (CRITICAL for ProtectedRoute)
export default AuthContext;