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
  USER_ROLE_UPDATED_SUCCESSFULLY = 'USER_ROLE_UPDATED_SUCCESSFULLY',
  USER_VERIFIED_SUCCESSFULLY = 'USER_VERIFIED_SUCCESSFULLY',
}

export enum ErrorResponseMessages {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  FAILED_TO_SEND_MAIL = 'FAILED_TO_SEND_MAIL',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  VALIDATION_FAILEd = 'VALIDATION_FAILED',
  TOKEN_AND_EMAIL_MUST_BE_PROVIDED = 'TOKEN_AND_EMAIL_MUST_BE_PROVIDED',
  USER_IS_NOT_ADMIN = 'USER_IS_NOT_ADMIN',
  INVALID_VERIFICATION_TOKEN = 'INVALID_VERIFICATION_TOKEN',
  VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED',
}
