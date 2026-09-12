import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // ✅ Not authenticated - redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role check
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;