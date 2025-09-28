import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { IApiResponse, IApiPaginationMeta } from 'interface/api.interface';
import { LoggerService } from 'services/logger/logger.service';

@Catch()
export class ExceptionInterceptor implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {
    this.loggerService.setContext('AllExceptionsFilter');
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error message
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Log the error
    this.loggerService.error(
      `Exception caught: ${message}`,
      exception.stack,
      {
        path: request.url,
        method: request.method,
        statusCode: status,
      } as any, // Cast to any to avoid type mismatch
    );

    // Calculate timing metadata
    const startTimestamp = Date.now();
    const endTime = process.hrtime();
    const processingTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;
    const timestamp = new Date().toLocaleString();

    // Create metadata object
    const metadata: IApiPaginationMeta = {
      timings: {
        processingTime: `${Math.round(processingTimeMs)} ms`,
        serverTime: timestamp,
        requestReceived: new Date(startTimestamp).toLocaleString(),
        responseSent: new Date().toLocaleString(),
      },
      request: {
        path: request.url,
        method: request.method,
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'],
      },
    };

    // Standardize response format
    const apiResponse: IApiResponse<null> = {
      data: null,
      meta: metadata,
      success: false,
      message: message,
      statusCode: status,
    };

    response.status(status).json(apiResponse);
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      (request.connection as any)?.remoteAddress || // Use type assertion
      'unknown'
    );
  }
}
