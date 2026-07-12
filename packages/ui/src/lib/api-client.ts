import { IApiResponse } from "../types/api.types";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiClientOptions extends Omit<RequestInit, "method" | "body"> {
  body?: any;
}

export class ApiClientService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Normalize base URL trailing slashes
  }

  /**
   * Core request orchestrator that mirrors the NestJS interceptor envelope rules.
   * Returns the exact, raw `IApiResponse<T>` shape from the backend streams.
   */
  public async request<T>(
    method: HttpMethod,
    path: string,
    options: ApiClientOptions = {},
  ): Promise<IApiResponse<T>> {
    const { body, headers = {}, ...restOptions } = options;
    const url = `${this.baseUrl}/${path.replace(/^\//, "")}`;

    const config: RequestInit = {
      method,
      headers: { ...headers },
      credentials: "include", // Crucial: Permits cookie setting/sending via this.setTokenCookies
      ...restOptions,
    };

    // Automatically manage payload content mapping and sanitation pipelines
    if (body !== undefined && body !== null) {
      if (body instanceof FormData) {
        config.body = body;
        // Let the browser environment set standard boundaries dynamically
      } else if (typeof body === "object") {
        config.body = JSON.stringify(body);
        (config.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      } else {
        config.body = String(body);
      }
    }

    try {
      const response = await fetch(url, config);

      // Every response from your backend is guaranteed to match IApiResponse JSON structure
      return (await response.json()) as IApiResponse<T>;
    } catch (networkError: any) {
      // Synthesize a structured response matching ExceptionInterceptor format if server drops connection
      return {
        success: false,
        statusCode: 503,
        message: networkError?.message || "Network unreachable or server down",
        data: null as unknown as T,
        meta: {
          timings: {
            processingTime: "0 ms",
            serverTime: new Date().toLocaleString(),
            requestReceived: new Date().toLocaleString(),
            responseSent: new Date().toLocaleString(),
          },
          request: {
            path,
            method,
            ip: "unknown",
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : "client",
          },
        },
      };
    }
  }

  /* Fluent helper utilities mimicking standard backend operation flows */

  public async get<T>(
    path: string,
    options?: ApiClientOptions,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  public async post<T>(
    path: string,
    body?: any,
    options?: ApiClientOptions,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("POST", path, { ...options, body });
  }

  public async patch<T>(
    path: string,
    body?: any,
    options?: ApiClientOptions,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  public async put<T>(
    path: string,
    body?: any,
    options?: ApiClientOptions,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  public async delete<T>(
    path: string,
    options?: ApiClientOptions,
  ): Promise<IApiResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }
}
