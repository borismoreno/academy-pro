import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  currentAcademyId: string | null;
  academyName: string | null;
  setAuth: (token: string, user: AuthUser, role: UserRole) => void;
  setCurrentAcademy: (academyId: string | null, academyName?: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      currentAcademyId: null,
      academyName: null,
      setAuth: (token, user, role) => set({ token, user, role }),
      setCurrentAcademy: (academyId, academyName) =>
        set({ currentAcademyId: academyId ?? null, ...(academyName !== undefined && { academyName: academyName ?? null }) }),
      clearAuth: () =>
        set({ token: null, user: null, role: null, currentAcademyId: null, academyName: null }),
    }),
    { name: 'academy-pro-auth' },
  ),
);
