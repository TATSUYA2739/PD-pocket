import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function AuthRoute({ allowedRoles }) {
  const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'host') {
      return <Navigate to="/host/dashboard" replace />;
    } else {
      return <Navigate to="/parent/calendar" replace />;
    }
  }

  return <Outlet />;
}

export default AuthRoute;