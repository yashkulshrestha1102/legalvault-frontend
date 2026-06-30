import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Context Create Karo
const AuthContext = createContext();

// 2. AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Page refresh par localStorage se user load karo
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'https://legalvault-jm2n.onrender.com';
  console.log('API_URL:', API_URL);

  // Login Function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      console.log('✅ Login response - User:', user);
      console.log('📁 Folder Permissions:', user?.folderPermissions);
      
      // ✅ Token aur user dono localStorage mein save karo
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthToken(token);
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

  // Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ✅ User bhi hatao
    setAuthToken(null);
    setUser(null);
  };

  const value = {
    user,
    authToken,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom Hook (useAuth)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 4. Default Export
export default AuthContext;