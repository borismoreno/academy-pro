import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { isRouteAllowed } from '@/config/navigation';

/**
 * Protects nested routes with two synchronous checks:
 *
 * 1. Authentication — no token → /login (preserving attempted URL in state.from)
 * 2. Authorization  — role not permitted for this path → /unauthorized
 *
 * No allowedRoles prop — all permissions derive from navigation.ts.
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  // Check 1 — Authentication
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check 2 — Authorization (only when role is known)
  if (role && !isRouteAllowed(location.pathname, role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
