import {
  ApiError,
  ApiMeta,
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "../types/api.types";

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
    const origin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const base = this.baseUrl.startsWith("http")
      ? this.baseUrl
      : `${origin ?? ""}${this.baseUrl}`;
    const url = new URL(`${base}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  // Returns the full envelope { success, statusCode, message, data, meta }
  private async requestRaw<T>(
    path: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { params, body, ...fetchConfig } = config;
    const url = this.buildUrl(path, params);

    const headers: HeadersInit = {};
    const isFormData = body instanceof FormData;
    if (!isFormData && body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...fetchConfig,
      credentials: "include",
      headers: { ...headers, ...fetchConfig.headers },
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });

    // Guard against empty bodies (e.g. 204 No Content) or non-JSON responses
    const text = await response.text();
    const json: ApiResponse<T> = text
      ? JSON.parse(text)
      : ({} as ApiResponse<T>);

    if (!response.ok || !json.success) {
      throw new ApiError(
        json.message ?? response.statusText,
        json.statusCode ?? response.status,
        json.meta as ApiMeta | undefined,
      );
    }

    return json;
  }

  private async request<T>(
    path: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const json = await this.requestRaw<T>(path, config);
    return json.data;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(path, { method: "GET", params });
  }

  // For list endpoints whose payload is { items, meta: PaginationMeta }
  // e.g. GET /admin/organizations -> ListOrganizationsHandler
  async getPaginated<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<PaginatedResponse<T>> {
    return this.request<PaginatedResponse<T>>(path, {
      method: "GET",
      params,
    });
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
    return this.request<T>(path, { method: "POST", body: formData });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
