import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRoute } from '@/config/navigation';

// Layouts
import AppLayout from '@/layouts/AppLayout';

// Route guards
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import PublicOnlyRoute from '@/components/shared/PublicOnlyRoute';

// Auth (public)
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AcceptInvitationPage = lazy(() => import('@/pages/auth/AcceptInvitationPage'));

// Protected pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TeamsPage = lazy(() => import('@/pages/TeamsPage'));
const TeamDetailPage = lazy(() => import('@/pages/teams/TeamDetailPage'));
const PlayersPage = lazy(() => import('@/pages/PlayersPage'));
const PlayerDetailPage = lazy(() => import('@/pages/players/PlayerDetailPage'));
const AttendancePage = lazy(() => import('@/pages/attendance/AttendancePage'));
const SessionDetailPage = lazy(() => import('@/pages/attendance/SessionDetailPage'));
const EvaluationsPage = lazy(() => import('@/pages/evaluations/EvaluationsPage'));
const EvaluationDetailPage = lazy(() => import('@/pages/evaluations/EvaluationDetailPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const PortalPage = lazy(() => import('@/pages/PortalPage'));

// Owner pages
const OwnerDashboardPage = lazy(() => import('@/pages/owner/OwnerDashboardPage'));
const OwnerAcademiesPage = lazy(() => import('@/pages/owner/OwnerAcademiesPage'));
const OwnerAcademyDetailPage = lazy(() => import('@/pages/owner/OwnerAcademyDetailPage'));
const OwnerSubscriptionsPage = lazy(() => import('@/pages/owner/OwnerSubscriptionsPage'));
const OwnerPlanLimitsPage = lazy(() => import('@/pages/owner/OwnerPlanLimitsPage'));
const OwnerUsersPage = lazy(() => import('@/pages/owner/OwnerUsersPage'));

// Error pages
const UnauthorizedPage = lazy(() => import('@/pages/errors/UnauthorizedPage'));

const AppFallback = () => (
  <div className="flex items-center justify-center h-screen bg-surface-low">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-on-surface-variant font-body">Cargando...</p>
    </div>
  </div>
);

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
      <Suspense fallback={<AppFallback />}>
      <Routes>
        {/* Auth pages — redirect away if already authenticated */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
