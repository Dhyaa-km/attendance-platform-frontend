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
  const { organizer, isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    // Waiting for session check
    return null;
  }

  if (isAuthenticated && organizer) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    const targetRoute = organizer.role === 'admin' ? APP_ROUTES.DASHBOARD : APP_ROUTES.SCANNER;
    return <Navigate to={from || targetRoute} replace />;
  }

  return <>{children}</>;
};
