import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyEmail, resendVerification } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

function extractErrorMessage(error: Error, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data?.message;
    if (Array.isArray(data)) return data.join(', ');
    if (data) return data;
  }
  return fallback;
}

export function useVerifyEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyEmailMutation = useMutation<string, Error, string>({
    mutationFn: verifyEmail,
    onSuccess: () => {
      toast({
        title: 'Correo verificado',
        description: 'Correo verificado correctamente. Ya puedes iniciar sesión.',
      });
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error de verificación',
        description: extractErrorMessage(error, 'Error al verificar el correo'),
      });
    },
  });

  const resendVerificationMutation = useMutation<string, Error, string>({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast({
        title: 'Correo reenviado',
        description: 'Se ha reenviado el correo de verificación.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error al reenviar',
        description: extractErrorMessage(error, 'Error al reenviar el correo de verificación'),
      });
    },
  });

  return {
    verifyEmailMutation,
    resendVerificationMutation,
  };
}
