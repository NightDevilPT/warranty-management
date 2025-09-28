// interface/api.interface.ts
export interface IApiTimingMeta {
  processingTime: string;
  serverTime: string;
  requestReceived: string;
  responseSent: string;
}

export interface IApiRequestMeta {
  path: string;
  method: string;
  ip?: string;
  userAgent?: string;
}

export interface IApiPaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  timings?: IApiTimingMeta;
  request?: IApiRequestMeta;
}

export interface IApiResponse<T> {
  data: T;
  meta?: IApiPaginationMeta;
  message?: string;
  success: boolean;
  statusCode: number;
}