import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore.ts';
import { APP_ROUTES } from '../utils/constants.ts';

export interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects already-authenticated organizers away from public auth pages (e.g. /login)
 * to the mission dashboard or previously requested route.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    // Waiting for session check
    return null;
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || APP_ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
