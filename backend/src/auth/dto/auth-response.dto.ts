import { Role } from '@prisma/client';

export interface AcademyInfo {
  id: string;
  name: string;
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
