// http-error.service.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ErrorTypes } from 'interfaces/api-response.interface';

@Injectable()
export class HttpErrorService {
  throwError(errorType: ErrorTypes, context: string): any {
    const statusCode = this.getStatusCode(errorType);
    const message = `${context}`;

    // Directly throw the exception here
    return new HttpException(message, statusCode);
  }

  handleUnexpectedError(error: unknown): any {
    if (error instanceof HttpException) {
      throw error;
    }
    // Fallback to internal server error
    return new InternalServerErrorException('Unexpected server error occurred');
  }
  

  private getStatusCode(errorType: ErrorTypes): HttpStatus {
    switch (errorType) {
      case ErrorTypes.NotFound:
        return HttpStatus.NOT_FOUND;
      case ErrorTypes.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case ErrorTypes.Forbidden:
        return HttpStatus.FORBIDDEN;
      case ErrorTypes.BadRequest:
        return HttpStatus.BAD_REQUEST;
      case ErrorTypes.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case ErrorTypes.UnprocessableEntity:
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case ErrorTypes.Conflict:
        return HttpStatus.CONFLICT;
      case ErrorTypes.InvalidInput:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR; // Default to 500 if not found
    }
  }
}
