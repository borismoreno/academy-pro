import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/auth.service";
import type { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
}

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [token, navigate]);

  const mutation = useMutation({
    mutationFn: (password: string) => resetPassword(token ?? "", password),
    onSuccess: () => {
      toast({
        title: "Contraseña restablecida correctamente.",
      });
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ?? "Ocurrió un error. Inténtalo de nuevo.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
  });

  return {
    token,
    submit: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    errorMessage: mutation.error
      ? ((mutation.error as AxiosError<ApiErrorResponse>).response?.data
          ?.message ?? "Enlace inválido o expirado.")
      : null,
  };
}
