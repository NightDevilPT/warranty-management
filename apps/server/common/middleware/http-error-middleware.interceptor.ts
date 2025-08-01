import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from 'interfaces/api-response.interface';
import { LoggerService } from 'services/logger-service/index.service';

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

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorDetails = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as any).message ||
          (exceptionResponse as any).error ||
          message;
        errorDetails =
          (exceptionResponse as any).error || (exceptionResponse as any);
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
