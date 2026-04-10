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
  setAuth: (token: string, user: AuthUser, role: UserRole) => void;
  setCurrentAcademy: (academyId: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      currentAcademyId: null,
      setAuth: (token, user, role) => set({ token, user, role }),
      setCurrentAcademy: (academyId) => set({ currentAcademyId: academyId }),
      clearAuth: () => set({ token: null, user: null, role: null, currentAcademyId: null }),
    }),
    { name: 'academy-pro-auth' },
  ),
);
