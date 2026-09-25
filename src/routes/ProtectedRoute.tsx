import React from 'react';
import { Navigate } from 'react-router-dom';

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  userRole?: string;
  allowedRoles?: string[];
  redirectPath?: string;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  userRole,
  allowedRoles,
  redirectPath = '/login',
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <div className="forbidden">Access Denied: Insufficient permissions</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
