import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'doctor' | 'nurse' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center text-slate-700">
        <h2 className="text-xl font-bold text-red-600">Access Restricted</h2>
        <p className="mt-2 text-sm">Your account role ({user.role}) does not have permission to view this panel.</p>
      </div>
    );
  }

  return <>{children}</>;
};
