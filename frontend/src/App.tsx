import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRoute } from '@/config/navigation';

// Layouts
import AppLayout from '@/layouts/AppLayout';

// Auth (public)
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Protected pages
import DashboardPage from '@/pages/DashboardPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamDetailPage from '@/pages/teams/TeamDetailPage';
import PlayersPage from '@/pages/PlayersPage';
import AttendancePage from '@/pages/AttendancePage';
import EvaluationsPage from '@/pages/EvaluationsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import PortalPage from '@/pages/PortalPage';

// Error pages
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';

// Route guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute';

/**
 * Root redirect:
 * - Authenticated → role-based default route (/dashboard or /portal)
 * - Unauthenticated → /login
 */
function RootRedirect() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRoute(role ?? 'coach')} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — redirect away if already authenticated */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Error page — accessible without auth so the redirect lands correctly */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/*
         * Protected routes — single ProtectedRoute wrapper.
         * Auth + role checks happen inside ProtectedRoute using
         * the current pathname against ROUTE_PERMISSIONS in navigation.ts.
         */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/teams"        element={<TeamsPage />} />
            <Route path="/teams/:id"    element={<TeamDetailPage />} />
            <Route path="/players"      element={<PlayersPage />} />
            <Route path="/attendance"   element={<AttendancePage />} />
            <Route path="/evaluations"  element={<EvaluationsPage />} />
            <Route path="/notifications"element={<NotificationsPage />} />
            <Route path="/settings"     element={<SettingsPage />} />
            <Route path="/portal"       element={<PortalPage />} />
          </Route>
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
