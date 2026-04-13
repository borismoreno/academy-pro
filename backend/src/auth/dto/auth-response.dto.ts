import { Role } from '@prisma/client';

export interface AcademyInfo {
  id: string | null;   // null for saas_owner (no academy context)
  name: string | null; // null for saas_owner
  role: Role;
}

export interface AuthTokenResponse {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  academy: AcademyInfo;
}

export interface AcademySelectionResponse {
  requiresAcademySelection: true;
  academies: AcademyInfo[];
  selectionToken: string;
}

export type AuthResponse = AuthTokenResponse | AcademySelectionResponse;
