import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword } from "@/services/auth.service";
import type { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
}

export function useForgotPassword() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => {
      setSent(true);
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
    sent,
    submit: mutation.mutate,
    isPending: mutation.isPending,
  };
}
