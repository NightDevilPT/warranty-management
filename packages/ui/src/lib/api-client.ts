import type { IApiResponse } from "../types/api.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly meta?: IApiResponse<null>["meta"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\//, "")}`);
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
    method: string,
    path: string,
    config: RequestConfig = {},
  ): Promise<IApiResponse<T>> {
    const { params, body, headers = {}, ...rest } = config;
    const url = this.buildUrl(path, params);

    const fetchHeaders: HeadersInit = {
      ...(headers as Record<string, string>),
    };

    if (body !== undefined && !(body instanceof FormData)) {
      fetchHeaders["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      credentials: "include",
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
      ...rest,
    });

    const json: IApiResponse<T> = await response.json();
    return json;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("GET", path, { params });
  }

  async post<T>(path: string, body?: unknown): Promise<IApiResponse<T>> {
    return this.request<T>("POST", path, { body });
  }

  async patch<T>(path: string, body?: unknown): Promise<IApiResponse<T>> {
    return this.request<T>("PATCH", path, { body });
  }

  async put<T>(path: string, body?: unknown): Promise<IApiResponse<T>> {
    return this.request<T>("PUT", path, { body });
  }

  async delete<T>(path: string): Promise<IApiResponse<T>> {
    return this.request<T>("DELETE", path);
  }

  async upload<T>(path: string, file: File): Promise<IApiResponse<T>> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseUrl}/${path.replace(/^\//, "")}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const json: IApiResponse<T> = await response.json();
    return json;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
