"use client";

import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(options: RequestOptions): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
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
      const refreshed = await this.refreshToken();
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

  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) return false;

        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        if (!data.accessToken || !data.refreshToken) return false;
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
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