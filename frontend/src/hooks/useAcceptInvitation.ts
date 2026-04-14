import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  validateInvitationToken,
  acceptInvitation,
  login,
} from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { getDefaultRoute } from "@/config/navigation";
import { useToast } from "@/hooks/use-toast";
import type { InvitationDetails, UserRole } from "@/types";

interface AcceptFormData {
  fullName: string;
  password: string;
}

export function useAcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { setAuth, setCurrentAcademy } = useAuthStore();
  const { toast } = useToast();

  // ── Validate token on mount ──────────────────────────────────────────────
  const validationQuery = useQuery<InvitationDetails, Error>({
    queryKey: ["invitation", token],
    queryFn: () => {
      if (!token) throw new Error("Token no encontrado en la URL");
      return validateInvitationToken(token);
    },
    enabled: !!token,
    retry: false,
  });

  // ── Accept invitation mutation ───────────────────────────────────────────
  const acceptMutation = useMutation<string, Error, AcceptFormData>({
    mutationFn: (formData) => {
      if (!token) throw new Error("Token inválido");
      return acceptInvitation({ token, ...formData });
    },
    onSuccess: async (_message, formData) => {
      // The accept endpoint does not return a JWT — auto-login immediately
      try {
        const loginResponse = await login({
          email: validationQuery.data!.email,
          password: formData.password,
        });

        if ("requiresAcademySelection" in loginResponse) {
          navigate("/select-academy", { state: { data: loginResponse } });
          return;
        }

        const { accessToken, user, academy } = loginResponse;
        const role = academy.role as UserRole;
        setAuth(accessToken, user, role);
        setCurrentAcademy(academy.id, academy.name);
        navigate(getDefaultRoute(role), { replace: true });
      } catch {
        // Auto-login failed — fall back to login page
        navigate("/login", { replace: true });
      }
    },
    onError: (error) => {
      let message = "Error al crear la cuenta";
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (Array.isArray(msg)) message = msg.join(", ");
        else if (msg) message = String(msg);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
  });

  return {
    token,
    tokenMissing: !token,
    invitationDetails: validationQuery.data,
    isValidating: validationQuery.isLoading,
    validationError: validationQuery.error,
    isValidationError: validationQuery.isError,
    accept: acceptMutation.mutate,
    isAccepting: acceptMutation.isPending,
  };
}
