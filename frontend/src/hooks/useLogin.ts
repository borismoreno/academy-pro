import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { login, type LoginResponse } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

interface LoginVariables {
  email: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth, setCurrentAcademy } = useAuthStore();

  const mutation = useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: login,
    onSuccess: (data) => {
      if ('requiresAcademySelection' in data) {
        // Multi-academy flow — to be handled in a future screen
        // Store selection token and navigate to academy selector
        navigate('/select-academy', { state: { data } });
        return;
      }

      setAuth(data.accessToken, data.user, data.academy.role);
      setCurrentAcademy(data.academy.id);
      navigate('/dashboard');
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
