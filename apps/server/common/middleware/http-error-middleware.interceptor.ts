import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from 'interfaces/api-response.interface';
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
      } else if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as any).message ||
          (exceptionResponse as any).error ||
          message;
        errorDetails =
          (exceptionResponse as any).error || (exceptionResponse as any);
      }
    }

    // 🔥 Log the error
    this.logger.error(
      `${request.method} ${request.originalUrl} — ${message}`,
      stackTrace,
    );

    const errorResponse: ErrorResponse = {
      status: 'error',
      statusCode,
      message,
      error: errorDetails,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
      },
    };

    response.status(statusCode).json(errorResponse);
  }
}
