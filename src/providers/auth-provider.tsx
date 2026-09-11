"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone?: string;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const { user, isAuthenticated, isLoading } = store;
  const pathname = usePathname();
  const hasCheckedSession = React.useRef(false);

  const login = React.useCallback(
    async (phone: string, password: string, rememberMe = false) => {
      const result = await apiClient.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/api/auth/login", { phone, password, rememberMe });

      store.login(result.user, result.accessToken, result.refreshToken);
    },
    [store]
  );

  const register = React.useCallback(
    async (data: RegisterData) => {
      await apiClient.post("/api/auth/register", data);
    },
    []
  );

  const logout = React.useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      store.logout();
      window.location.replace("/");
    }
  }, [store]);

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: store.token ? { Authorization: `Bearer ${store.token}` } : undefined,
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        store.logout();
        return;
      }

      const result = (await response.json()) as { user: AuthUser };
      store.setUser(result.user);
    } catch {
      store.logout();
    }
  }, [store]);

  React.useEffect(() => {
    if (hasCheckedSession.current) return;
    if (pathname === "/login" || pathname === "/register" || pathname === "/admin/login") return;
    hasCheckedSession.current = true;
    void refreshUser();
  }, [pathname, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}