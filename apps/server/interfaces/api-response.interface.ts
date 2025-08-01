export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  data: T | T[] | null;
  error?: string | Record<string, any> | null;
  meta?: {
    timestamp: string;
    path: string;
    [key: string]: any; // Allow for more meta fields
  };
}

// error-types.enum.ts
export enum ErrorTypes {
  NotFound = 'Not Found',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  BadRequest = 'Bad Request',
  InternalServerError = 'Internal Server Error',
  UnprocessableEntity = 'Unprocessable Entity',
  Conflict = 'Conflict',
  InvalidInput = 'Invalid Input',
}
