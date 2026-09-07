"use client";

import * as React from "react";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
  const hasCheckedSession = React.useRef(false);

  const login = React.useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const result = await apiClient.post<{
        user: AuthUser;
        token: string;
        refreshToken: string;
      }>("/api/auth/login", { email, password, rememberMe });

      store.login(result.user, result.token, result.refreshToken);
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
    }
  }, [store]);

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
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
    hasCheckedSession.current = true;
    void refreshUser();
  }, [refreshUser]);

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