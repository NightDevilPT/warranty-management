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

        // Handle token extraction and cookie setting
        const { accessToken, refreshToken, ...cleanData } =
          this.extractTokens(data);

        if (accessToken || refreshToken) {
          this.setTokenCookies(response, accessToken, refreshToken);
        }

        const statusCode = this.getStatusCode(context, cleanData);
        const message = this.getMessage(
          context,
          cleanData?.message,
          statusCode,
        );

        // Create metadata object
        const metadata = this.createMetadata(
          request,
          startTimestamp,
          processingTimeMs,
        );

        // If data is already formatted with our structure, enhance it
        if (this.isAlreadyFormatted(cleanData)) {
          return {
            success: cleanData.success ?? this.isSuccess(statusCode),
            data: cleanData.data as T,
            statusCode: cleanData.statusCode || statusCode,
            message: cleanData.message || message,
            meta: {
              ...cleanData.meta,
              ...metadata,
            },
          } as IApiResponse<T>;
        }

        // Extract data and meta based on common patterns
        const responseData = this.extractData(cleanData) as T;
        const existingMeta = this.extractMeta(cleanData);

        return {
          success: this.isSuccess(statusCode),
          data: responseData,
          meta: {
            ...existingMeta,
            ...metadata,
          },
          message: message,
          statusCode: statusCode,
        } as IApiResponse<T>;
      }),
    );
  }

  /**
   * Extract tokens from response data and return them separately
   */
  private extractTokens(data: any): {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: any;
  } {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const tokens: { accessToken?: string; refreshToken?: string } = {};
    const remainingData = { ...data };

    // Extract tokens if they exist in the response
    if ('accessToken' in remainingData) {
      tokens.accessToken = remainingData.accessToken;
      delete remainingData.accessToken;
    }

    if ('refreshToken' in remainingData) {
      tokens.refreshToken = remainingData.refreshToken;
      delete remainingData.refreshToken;
    }

    // Also check nested data object for tokens
    if (remainingData.data && typeof remainingData.data === 'object') {
      const nestedTokens = this.extractTokens(remainingData.data);

      if (nestedTokens.accessToken || nestedTokens.refreshToken) {
        tokens.accessToken = tokens.accessToken || nestedTokens.accessToken;
        tokens.refreshToken = tokens.refreshToken || nestedTokens.refreshToken;
        remainingData.data = this.removeTokens(nestedTokens);
      }
    }

    return { ...tokens, ...remainingData };
  }

  /**
   * Remove token properties from an object
   */
  private removeTokens(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const clean = { ...data };
    delete clean.accessToken;
    delete clean.refreshToken;
    return clean;
  }

  /**
   * Set access and refresh tokens as HTTP-only cookies
   */
  private setTokenCookies(
    response: any,
    accessToken?: string,
    refreshToken?: string,
  ): void {
    // For localhost development, we need specific settings
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // false for localhost (HTTP)
      sameSite: isProduction ? 'strict' : 'lax', // 'lax' for localhost
      path: '/',
      domain: isProduction ? '.yourdomain.com' : 'localhost',
    };

    if (accessToken) {
      response.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
    }

    if (refreshToken) {
      response.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
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
