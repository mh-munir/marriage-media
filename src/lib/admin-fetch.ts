"use client";

import { useAuthStore } from "@/stores/auth-store";
import { refreshSession } from "@/lib/api-client";

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return requestWithAdminSession(input, init);
}

async function requestWithAdminSession(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = useAuthStore.getState().token;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(input, { ...init, headers, credentials: "include" });
  if (response.status !== 401) return response;

  if (!(await refreshSession())) return response;
  const accessToken = useAuthStore.getState().token;
  if (!accessToken) return response;
  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${accessToken}`);
  return fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
}
