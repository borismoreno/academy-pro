import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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

export function useVerifyEmail(token: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const toastShown = useRef(false);

  const verifyEmailQuery = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => verifyEmail(token!),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (verifyEmailQuery.isSuccess && !toastShown.current) {
      toastShown.current = true;
      toast({
        title: 'Correo verificado',
        description: 'Correo verificado correctamente. Ya puedes iniciar sesión.',
      });
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [verifyEmailQuery.isSuccess]);

  useEffect(() => {
    if (verifyEmailQuery.isError && !toastShown.current) {
      toastShown.current = true;
      toast({
        variant: 'destructive',
        title: 'Error de verificación',
        description: extractErrorMessage(
          verifyEmailQuery.error as Error,
          'Error al verificar el correo',
        ),
      });
    }
  }, [verifyEmailQuery.isError]);

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
    verifyEmailQuery,
    resendVerificationMutation,
  };
}
