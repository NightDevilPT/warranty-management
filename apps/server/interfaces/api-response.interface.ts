export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T | T[] | null;
  meta?: Record<string, any>;
}

// Standardized error response
export interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  error?: string | Record<string, any>;
  data: null;
  meta: {
    timestamp: string;
    path: string;
    [key: string]: any; // Allow for additional meta fields
  };
}
