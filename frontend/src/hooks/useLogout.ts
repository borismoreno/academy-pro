import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const logout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return { logout };
}
