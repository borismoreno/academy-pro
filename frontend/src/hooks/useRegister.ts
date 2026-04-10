import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { register } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

interface RegisterVariables {
  fullName: string;
  email: string;
  password: string;
  academyName: string;
}

export function useRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation<string, Error, RegisterVariables>({
    mutationFn: register,
    onSuccess: (_message, variables) => {
      navigate('/verify-email', { state: { email: variables.email } });
    },
    onError: (error) => {
      let message = 'Error al crear la cuenta';
      if (axios.isAxiosError(error)) {
        const data = error.response?.data?.message;
        if (Array.isArray(data)) {
          message = data.join(', ');
        } else if (data) {
          message = data;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: message,
      });
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
  };
}
