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

export enum SuccessResponseMessages {
  USER_CREATED_SUCCESSFULLY = 'USER_CREATED_SUCCESSFULLY',
}

export enum ErrorResponseMessages {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  FAILED_TO_SEND_MAIL = 'FAILED_TO_SEND_MAIL',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
