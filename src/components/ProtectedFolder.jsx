import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedFolder = ({ children, folderId }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin ko sab access
  if (user.role === 'admin') {
    return children;
  }

  // ✅ Check if user has permission for this folder
  const hasAccess = user.folderPermissions?.includes(folderId) || false;

  if (!hasAccess) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-6xl mb-4">⛔</div>
        <div className="text-xl text-red-400">Access Denied</div>
        <div className="text-sm text-gray-400 mt-2">
          You don't have permission to view this folder.
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedFolder;