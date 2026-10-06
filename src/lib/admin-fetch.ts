"use client";

import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { useAuthStore } from "@/stores/auth-store";
import { refreshSession } from "@/lib/api-client";

let refreshPromise: Promise<boolean> | null = null;

async function refreshAdminSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = useAdminAuthStore.getState().refreshToken;
      const response = await fetch("/api/admin/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });
      if (!response.ok) {
        if (response.status === 401) {
          useAdminAuthStore.getState().logout();
          if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
            window.location.replace("/admin/login");
          }
        }
        return false;
      }

      const tokens = await response.json();
      if (!tokens.accessToken || !tokens.refreshToken) return false;
      useAdminAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return requestWithAdminSession(input, init);
}

async function requestWithAdminSession(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const headers = new Headers(init.headers);
  const token = isAdminRoute
    ? useAdminAuthStore.getState().token
    : useAuthStore.getState().token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers, credentials: "include" });
  if (response.status !== 401) return response;

  const refreshed = isAdminRoute
    ? await refreshAdminSession()
    : await refreshSession();
  if (!refreshed) return response;

  const accessToken = isAdminRoute
    ? useAdminAuthStore.getState().token
    : useAuthStore.getState().token;
  if (!accessToken) return response;
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${accessToken}`);
  return fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
}
