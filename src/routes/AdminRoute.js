import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/auth';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
};

export default AdminRoute;



