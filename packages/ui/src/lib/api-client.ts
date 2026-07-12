import { ApiError, ApiResponse } from "../types/api.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    path: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const { params, body, ...fetchConfig } = config;
    const url = this.buildUrl(path, params);

    const headers: HeadersInit = {};

    // Only set Content-Type for non-FormData requests
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...fetchConfig,
      credentials: "include", // Sends cookies (accessToken, refreshToken)
      headers: {
        ...headers,
        ...fetchConfig.headers,
      },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(data.message, data.statusCode, data.meta);
    }

    return data.data;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(path, { method: "GET", params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  async upload<T>(path: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new ApiError(data.message, data.statusCode, data.meta);
    }

    return data.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
