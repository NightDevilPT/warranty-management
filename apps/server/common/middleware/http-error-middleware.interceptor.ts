import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'services/logger-service/index.service';
import { ApiResponse, ErrorResponseMessages } from 'interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errorDetails: any = null;
    let stackTrace = exception?.stack;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      console.log('exceptionResponse', exceptionResponse);

      let validationDetails: any = null;

      // Detect class-validator errors
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        Array.isArray((exceptionResponse as any)['message'])
      ) {
        // message is an array => validation error (class-validator)
        // Attach all validation error objects to errorDetails
        validationDetails = (exceptionResponse as any)['message'];
        message = ErrorResponseMessages.VALIDATION_FAILEd; // Always just one string in message
        errorDetails = validationDetails; // Show all details in error
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorDetails = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || message;
        errorDetails = resp.error || resp;
      }
    } else {
      errorDetails = exception?.message || exception?.toString();
    }

    this.logger.error(
      `${request.method} ${request.originalUrl} — ${message}`,
      stackTrace,
    );

    const errorResponse: ApiResponse<null> = {
      status: 'error',
      statusCode,
      message,
      data: null,
      error: errorDetails,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      },
    };

    response.status(statusCode).json(errorResponse);
  }
}
