import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  const logout = () => {
    clearAuth();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return { logout };
}
