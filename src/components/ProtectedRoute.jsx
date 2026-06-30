import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  // ✅ Context se saari values lo
  const { user, authToken, loading } = useContext(AuthContext);

  // Agar loading ho rahi hai toh loading dikhao
  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  // Agar user nahi hai ya token nahi hai toh login pe bhejo
  if (!user || !authToken) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role check (agar requiredRole pass kiya gaya hai)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      // Agar role match nahi karta toh dashboard pe bhejo
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Agar sab sahi hai toh children render karo
  return children;
};

export default ProtectedRoute;