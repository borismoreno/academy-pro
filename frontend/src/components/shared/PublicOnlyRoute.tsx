import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { getDefaultRoute } from '@/config/navigation';

/**
 * Inverse of ProtectedRoute — wraps auth pages that authenticated users
 * should never see (login, register, etc.).
 *
 * Authenticated → redirect to role's default route (synchronous, no flash).
 * Unauthenticated → render the page normally via <Outlet />.
 */
export default function PublicOnlyRoute() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (token) {
    return <Navigate to={getDefaultRoute(role ?? 'coach')} replace />;
  }

  return <Outlet />;
}
