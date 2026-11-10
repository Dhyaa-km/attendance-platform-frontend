import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../utils/constants.ts';
import { useAuthStore } from '../stores/useAuthStore.ts';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { GuestRoute } from './GuestRoute.tsx';
import { AppLayout } from '../components/layout/AppLayout.tsx';
import { AuthLayout } from '../components/layout/AuthLayout.tsx';

// Code-split route chunks for performance and mobile loading speed
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage.tsx').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage.tsx').then((m) => ({ default: m.DashboardPage }))
);
const ScannerPage = lazy(() =>
  import('../features/scanner/ScannerPage.tsx').then((m) => ({ default: m.ScannerPage }))
);
const ParticipantsPage = lazy(() =>
  import('../features/participants/ParticipantsPage.tsx').then((m) => ({ default: m.ParticipantsPage }))
);
const AttendancePage = lazy(() =>
  import('../features/attendance/AttendancePage.tsx').then((m) => ({ default: m.AttendancePage }))
);
const DesignSystemPage = lazy(() =>
  import('../features/design-system/DesignSystemPage.tsx').then((m) => ({ default: m.DesignSystemPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/common/NotFoundPage.tsx').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center font-telemetry text-cyan-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-widest text-slate-400">
        INITIALIZING MODULE...
      </span>
    </div>
  </div>
);

export const AppRouter: React.FC = () => {
  const { initialize, organizer } = useAuthStore();
  const homeRoute = organizer?.role === 'admin' ? APP_ROUTES.DASHBOARD : APP_ROUTES.SCANNER;

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Organizer Authentication (Redirects to dashboard if already authenticated) */}
          <Route
            element={
              <GuestRoute>
                <AuthLayout />
              </GuestRoute>
            }
          >
            <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          {/* Protected Operations Platform Shell */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path={APP_ROUTES.HOME} element={<Navigate to={homeRoute} replace />} />
            <Route
              path={APP_ROUTES.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={APP_ROUTES.SCANNER}
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <ScannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={APP_ROUTES.PARTICIPANTS}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ParticipantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={APP_ROUTES.ATTENDANCE}
              element={
                <ProtectedRoute allowedRoles={['admin', 'organizer']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={APP_ROUTES.DESIGN_SYSTEM}
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DesignSystemPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
