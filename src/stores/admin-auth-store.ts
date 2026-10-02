import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/stores/auth-store";

interface AdminAuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setSession: (user: AuthUser, token: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true,
      hasHydrated: false,
      setSession: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isLoading: false }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isLoading: false }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated, isLoading: false }),
    }),
    {
      name: "marriage-media-admin-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
