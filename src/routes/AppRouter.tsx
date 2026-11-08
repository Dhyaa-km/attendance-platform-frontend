import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../utils/constants.ts';
import { useAuthStore } from '../stores/useAuthStore.ts';
import { ProtectedRoute } from './ProtectedRoute.tsx';
import { GuestRoute } from './GuestRoute.tsx';
import { AppLayout } from '../components/layout/AppLayout.tsx';
import { AuthLayout } from '../components/layout/AuthLayout.tsx';
import { LoginPage } from '../features/auth/LoginPage.tsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx';
import { ScannerPage } from '../features/scanner/ScannerPage.tsx';
import { ParticipantsPage } from '../features/participants/ParticipantsPage.tsx';
import { AttendancePage } from '../features/attendance/AttendancePage.tsx';
import { DesignSystemPage } from '../features/design-system/DesignSystemPage.tsx';
import { NotFoundPage } from '../features/common/NotFoundPage.tsx';

export const AppRouter: React.FC = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
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
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={APP_ROUTES.HOME} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
          <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={APP_ROUTES.SCANNER} element={<ScannerPage />} />
          <Route path={APP_ROUTES.PARTICIPANTS} element={<ParticipantsPage />} />
          <Route path={APP_ROUTES.ATTENDANCE} element={<AttendancePage />} />
          <Route path={APP_ROUTES.DESIGN_SYSTEM} element={<DesignSystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
