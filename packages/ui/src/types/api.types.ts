export interface ApiMeta {
  timings: {
    processingTime: string;
    serverTime: string;
    requestReceived: string;
    responseSent: string;
  };
  request: {
    path: string;
    method: string;
    ip: string;
    userAgent: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  meta: ApiMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly meta?: ApiMeta;

  constructor(message: string, statusCode: number, meta?: ApiMeta) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  role?: string;
  partnerType?: string;
  dealerTypeId?: string;
  parentId?: string;
}
