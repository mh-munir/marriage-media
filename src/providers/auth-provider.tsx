"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
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
  const resetNotifications = useNotificationStore((state) => state.reset);
  const { user, isAuthenticated, isLoading } = store;
  const pathname = usePathname();
  const hasCheckedSession = React.useRef(false);
  const previousUserId = React.useRef<string | null>(null);

  const login = React.useCallback(
    async (phone: string, password: string, rememberMe = false) => {
      const result = await apiClient.post<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>("/api/auth/login", { phone, password, rememberMe });

      resetNotifications();
      store.login(result.user, result.accessToken, result.refreshToken);
    },
    [resetNotifications, store]
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
      resetNotifications();
      store.logout();
      window.location.replace("/");
    }
  }, [resetNotifications, store]);

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) {
        resetNotifications();
        store.logout();
        return;
      }
      const result = (await response.json()) as { user: AuthUser };
      store.setUser(result.user);
    } catch {
      resetNotifications();
      store.logout();
    }
  }, [resetNotifications, store]);

  React.useEffect(() => {
    if (hasCheckedSession.current) return;
    if (pathname === "/login" || pathname === "/register" || pathname === "/admin/login") return;
    hasCheckedSession.current = true;
    void refreshUser();
  }, [pathname, refreshUser]);

  React.useEffect(() => {
    if (!user?.id) {
      previousUserId.current = null;
      return;
    }

    if (previousUserId.current && previousUserId.current !== user.id) {
      resetNotifications();
    }

    previousUserId.current = user.id;
  }, [resetNotifications, user?.id]);

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