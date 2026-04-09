import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  currentAcademyId: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  setCurrentAcademy: (academyId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentAcademyId: null,
      setAuth: (token, user) => set({ token, user }),
      setCurrentAcademy: (academyId) => set({ currentAcademyId: academyId }),
      logout: () => set({ token: null, user: null, currentAcademyId: null }),
    }),
    { name: 'academy-pro-auth' },
  ),
);
