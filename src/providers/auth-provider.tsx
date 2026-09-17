"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, type AuthUser } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const loginUser = useAuthStore((state) => state.login);
  const logoutUser = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const resetNotifications = useNotificationStore((state) => state.reset);
  const pathname = usePathname();
  const router = useRouter();
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
      loginUser(result.user, result.accessToken, result.refreshToken);
    },
    [loginUser, resetNotifications]
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
      logoutUser();
      window.location.replace("/");
    }
  }, [logoutUser, resetNotifications]);

  const refreshUser = React.useCallback(async () => {
    try {
      const result = await apiClient.get<{ user: AuthUser }>("/api/auth/me", {
        cache: "no-store",
        credentials: "include",
      });
      setUser(result.user);
    } catch (error) {
      // Do not destroy a persisted session on a transient network/server error.
      if (error instanceof Error && error.message === "SESSION_EXPIRED") {
        resetNotifications();
        logoutUser();
        if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
          router.replace("/login");
        }
      }
    }
  }, [logoutUser, pathname, resetNotifications, router, setUser]);

  React.useEffect(() => {
    if (hasCheckedSession.current) return;
    if (!hasHydrated) return;
    if (pathname === "/login" || pathname === "/register" || pathname === "/admin/login") return;
    hasCheckedSession.current = true;
    void refreshUser();
  }, [hasHydrated, pathname, refreshUser]);

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