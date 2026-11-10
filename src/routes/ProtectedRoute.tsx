import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.ts';
import { APP_ROUTES } from '../utils/constants.ts';
import type { OrganizerRole } from '../types/auth.ts';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: OrganizerRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['admin', 'organizer'],
}) => {
  const { organizer, isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center font-telemetry text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest">
            AUTHENTICATING ORGANIZER TERMINAL...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !organizer) {
    return <Navigate to={APP_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(organizer.role)) {
    const fallbackRoute = organizer.role === 'admin' ? APP_ROUTES.DASHBOARD : APP_ROUTES.SCANNER;
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
