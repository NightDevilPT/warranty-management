// response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiPaginationMeta, IApiResponse } from 'interface/api.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Record various timing points
    const startTime = process.hrtime();
    const startTimestamp = Date.now();

    return next.handle().pipe(
      map((data) => {
        const endTime = process.hrtime(startTime);
        const processingTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;
        const timestamp = new Date().toLocaleString();

        const statusCode = this.getStatusCode(context, data);
        const message = this.getMessage(context, data?.message, statusCode);

        // Create metadata object
        const metadata = this.createMetadata(
          request,
          startTimestamp,
          processingTimeMs,
        );

        // If data is already formatted with our structure, enhance it
        if (this.isAlreadyFormatted(data)) {
          return {
            ...data,
            statusCode: data.statusCode || statusCode,
            message: data.message || message,
            meta: {
              ...data.meta,
              ...metadata,
            },
          };
        }

        // Extract data and meta based on common patterns
        const responseData = this.extractData(data);
        const existingMeta = this.extractMeta(data);

        return {
          data: responseData,
          meta: {
            ...existingMeta,
            ...metadata,
          },
          success: this.isSuccess(statusCode),
          message: message,
          statusCode: statusCode,
        };
      }),
    );
  }

  private createMetadata(
    request: any,
    startTimestamp: number,
    processingTimeMs: number,
  ) {
    const timestamp = new Date().toLocaleString();

    return {
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
  }

  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.connection?.socket?.remoteAddress ||
      'unknown'
    );
  }

  private isAlreadyFormatted(data: any): boolean {
    return (
      data && typeof data === 'object' && 'success' in data && 'data' in data
    );
  }

  private extractData(data: any): any {
    if (!data) return data;

    // Handle paginated responses
    if (data.items && Array.isArray(data.items)) {
      return data.items;
    }

    // Handle data property
    if (data.data !== undefined) {
      return data.data;
    }

    return data;
  }

  private extractMeta(data: any): IApiPaginationMeta | undefined {
    if (!data?.meta) return undefined;

    return this.transformPaginationMeta(data.meta);
  }

  private transformPaginationMeta(meta: any): IApiPaginationMeta {
    return {
      page: meta.page || meta.currentPage || 1,
      limit: meta.limit || meta.perPage || meta.take || 10,
      total: meta.total || meta.totalItems || 0,
      totalPages:
        meta.totalPages || Math.ceil((meta.total || 0) / (meta.limit || 10)),
      hasNext: meta.hasNext || meta.hasNextPage || false,
      hasPrev: meta.hasPrev || meta.hasPreviousPage || false,
    };
  }

  private getStatusCode(context: ExecutionContext, data: any): number {
    const response = context.switchToHttp().getResponse();
    return data?.statusCode || response.statusCode || 200;
  }

  private isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  private getMessage(
    context: ExecutionContext,
    existingMessage?: string,
    statusCode?: number,
  ): string | undefined {
    if (existingMessage) {
      return existingMessage;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const finalStatusCode = statusCode || response.statusCode;

    if (this.isSuccess(finalStatusCode)) {
      return this.getSuccessMessage(request.method);
    }

    return undefined;
  }

  private getSuccessMessage(httpMethod: string): string {
    const messages: { [key: string]: string } = {
      GET: 'Request processed successfully',
      POST: 'Resource created successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    return messages[httpMethod] || 'Operation completed successfully';
  }
}
