"use client";

import { useAuthStore } from "@/stores/auth-store";

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return requestWithAdminSession(input, init);
}

async function requestWithAdminSession(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = useAuthStore.getState().token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers, credentials: "include" });
  if (response.status !== 401) return response;

  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return response;
  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });
  if (!refreshResponse.ok) return response;
  const refreshed = (await refreshResponse.json()) as { accessToken?: string; refreshToken?: string };
  if (!refreshed.accessToken || !refreshed.refreshToken) return response;
  useAuthStore.getState().setTokens(refreshed.accessToken, refreshed.refreshToken);
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
  return fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
}
