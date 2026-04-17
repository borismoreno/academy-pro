import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const academyId = useAuthStore.getState().currentAcademyId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (academyId) {
    config.headers["X-Academy-Id"] = academyId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const queryClient = useQueryClient();
      const hadToken = !!useAuthStore.getState().token;
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      // Only redirect if the user had an active session (expired token).
      // A 401 from the login endpoint itself should surface as a mutation error.
      if (hadToken) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
