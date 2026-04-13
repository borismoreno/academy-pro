import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, type LoginResponse } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { isRouteAllowed, getDefaultRoute } from '@/config/navigation';
import type { UserRole } from '@/types';

interface LoginVariables {
  email: string;
  password: string;
}

interface UseLoginOptions {
  /**
   * Path to redirect to after a successful login.
   * Typically the `from` path saved by ProtectedRoute in location state.
   * If the path is not accessible for the authenticated role it is ignored
   * and the role's default route is used instead.
   */
  redirectAfterLogin?: string;
}

export function useLogin(options: UseLoginOptions = {}) {
  const navigate = useNavigate();
  const { setAuth, setCurrentAcademy } = useAuthStore();

  const mutation = useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: login,
    onSuccess: (data) => {
      if ('requiresAcademySelection' in data) {
        // Multi-academy flow — navigate to selector screen
        navigate('/select-academy', { state: { data } });
        return;
      }

      const { accessToken, user, academy } = data;
      const role: UserRole = academy.role as UserRole;

      setAuth(accessToken, user, role);
      // Persist academy context — saas_owner has no academy (both null)
      setCurrentAcademy(academy.id, academy.name);

      // Determine where to send the user:
      // 1. Use `redirectAfterLogin` if it is a route the role can access.
      // 2. Otherwise fall back to the role's default landing page.
      const { redirectAfterLogin } = options;
      const destination =
        redirectAfterLogin && isRouteAllowed(redirectAfterLogin, role)
          ? redirectAfterLogin
          : getDefaultRoute(role);

      navigate(destination, { replace: true });
    },
  });

  const errorMessage = (() => {
    if (!mutation.error) return null;
    if (axios.isAxiosError(mutation.error)) {
      const message = mutation.error.response?.data?.message;
      if (Array.isArray(message)) return message.join(', ');
      return message ?? 'Error al iniciar sesión';
    }
    return 'Error al iniciar sesión';
  })();

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage,
  };
}
