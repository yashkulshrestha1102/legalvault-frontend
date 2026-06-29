import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // ✅ Context se saari values lo
  const { user, authToken, loading } = useContext(AuthContext);

  // Agar loading ho rahi hai toh loading dikhao
  if (loading) {
    return <div>Loading...</div>;
  }

  // Agar user nahi hai ya token nahi hai toh login pe bhejo
  if (!user || !authToken) {
    return <Navigate to="/login" replace />;
  }

  // Agar sab sahi hai toh children render karo
  return children;
};

export default ProtectedRoute;