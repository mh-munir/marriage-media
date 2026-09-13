import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isPremium: boolean;
  premiumPlan?: string;
  isVerified: boolean;
  profileCompleted: number;
  gender?: "Male" | "Female";
  onboardingCompleted: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),

      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "marriage-media-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);