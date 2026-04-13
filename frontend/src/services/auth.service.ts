import api from "./api";
import type { ApiResponse, UserRole } from "@/types";

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  academyName: string;
}

export async function register(payload: RegisterPayload): Promise<string> {
  const response = await api.post<ApiResponse<null>>("/auth/register", payload);
  return response.data.message;
}

export async function verifyEmail(token: string): Promise<string> {
  const response = await api.get<ApiResponse<null>>("/auth/verify-email", {
    params: { token },
  });
  return response.data.message;
}

export async function resendVerification(email: string): Promise<string> {
  const response = await api.post<ApiResponse<null>>(
    "/auth/resend-verification",
    { email },
  );
  return response.data.message;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginData {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  academy: {
    id: string | null;   // null for saas_owner
    name: string | null; // null for saas_owner
    role: UserRole;
  };
}

export interface AcademyInfo {
  id: string | null;
  name: string | null;
  role: UserRole;
}

interface AcademySelectionData {
  requiresAcademySelection: true;
  academies: AcademyInfo[];
  selectionToken: string;
}

export type LoginResponse = LoginData | AcademySelectionData;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  );
  return response.data.data;
}
