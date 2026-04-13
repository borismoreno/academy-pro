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
import PlayerDetailPage from '@/pages/players/PlayerDetailPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import SessionDetailPage from '@/pages/attendance/SessionDetailPage';
import EvaluationsPage from '@/pages/evaluations/EvaluationsPage';
import EvaluationDetailPage from '@/pages/evaluations/EvaluationDetailPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SettingsPage from '@/pages/SettingsPage';
import PortalPage from '@/pages/PortalPage';

// Owner pages
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage';
import OwnerAcademiesPage from '@/pages/owner/OwnerAcademiesPage';
import OwnerAcademyDetailPage from '@/pages/owner/OwnerAcademyDetailPage';
import OwnerSubscriptionsPage from '@/pages/owner/OwnerSubscriptionsPage';
import OwnerPlanLimitsPage from '@/pages/owner/OwnerPlanLimitsPage';
import OwnerUsersPage from '@/pages/owner/OwnerUsersPage';

// Error pages
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';

// Route guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute';

/**
 * Root redirect:
 * - Authenticated → role-based default route (/owner/dashboard, /dashboard, or /portal)
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
            <Route path="/dashboard"       element={<DashboardPage />} />
            <Route path="/teams"           element={<TeamsPage />} />
            <Route path="/teams/:id"       element={<TeamDetailPage />} />
            <Route path="/players"         element={<PlayersPage />} />
            <Route path="/players/:id"     element={<PlayerDetailPage />} />
            <Route path="/attendance"      element={<AttendancePage />} />
            <Route path="/attendance/:id"  element={<SessionDetailPage />} />
            <Route path="/evaluations"     element={<EvaluationsPage />} />
            <Route path="/evaluations/:id" element={<EvaluationDetailPage />} />
            <Route path="/notifications"   element={<NotificationsPage />} />
            <Route path="/settings"        element={<SettingsPage />} />
            <Route path="/portal"          element={<PortalPage />} />

            {/* Owner routes */}
            <Route path="/owner/dashboard"     element={<OwnerDashboardPage />} />
            <Route path="/owner/academies"     element={<OwnerAcademiesPage />} />
            <Route path="/owner/academies/:id" element={<OwnerAcademyDetailPage />} />
            <Route path="/owner/subscriptions" element={<OwnerSubscriptionsPage />} />
            <Route path="/owner/plan-limits"   element={<OwnerPlanLimitsPage />} />
            <Route path="/owner/users"         element={<OwnerUsersPage />} />
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
