import api from './api';
import type { ApiResponse, UserRole } from '@/types';

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
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface AcademyInfo {
  id: string;
  name: string;
  role: UserRole;
}

interface AcademySelectionData {
  requiresAcademySelection: true;
  academies: AcademyInfo[];
  selectionToken: string;
}

export type LoginResponse = LoginData | AcademySelectionData;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', payload);
  return response.data.data;
}
