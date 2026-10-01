"use client";

import { useAuthStore } from "@/stores/auth-store";

const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");
const isLocalApiHost = (() => {
  if (!configuredApiBaseUrl) return false;
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(configuredApiBaseUrl).hostname);
  } catch {
    return false;
  }
})();
const API_BASE_URL = process.env.NODE_ENV === "production" && isLocalApiHost
  ? ""
  : configuredApiBaseUrl;
let refreshPromise: Promise<boolean> | null = null;

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { refreshToken } = useAuthStore.getState();

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (!data.accessToken || !data.refreshToken) return false;
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(options: RequestOptions): Promise<HeadersInit> {
    const headers: HeadersInit = {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    };

    if (!options.skipAuth) {
      const token = useAuthStore.getState().token;
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response, allowRefresh = true): Promise<T> {
    if (response.status === 401) {
      if (!allowRefresh) {
        throw new Error("SESSION_EXPIRED");
      }
      const refreshed = await refreshSession();
      if (!refreshed) {
        throw new Error("SESSION_EXPIRED");
      }
      throw new Error("RETRY_REQUEST");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getHeaders(options);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.message === "RETRY_REQUEST") {
        const newHeaders = await this.getHeaders(options);
        const response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });
        return await this.handleResponse<T>(response, false);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
