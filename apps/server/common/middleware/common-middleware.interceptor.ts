import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';
import { ApiResponse } from 'interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const ACCESS_TOKEN_AGE = 10 * 60 * 1000;
    const REFRESH_TOKEN_AGE = 12 * 60 * 1000;
    const startTime = Date.now();

    return next.handle().pipe(
      map((resData: any) => {
        const endTime = Date.now();
        const timeTakenMs = endTime - startTime;

        const statusCode = resData?.statusCode || response.statusCode || 200;

        const { accessToken, refreshToken, ...data } = {
          ...(resData?.data ?? resData ?? {}),
        };

        if (accessToken) {
          response.cookie('accessToken', accessToken, {
            /* ... */
          });
        }
        if (refreshToken) {
          response.cookie('refreshToken', refreshToken, {
            /* ... */
          });
        }

        const message = resData?.message || 'Request completed successfully';
        const meta = {
          ...(resData?.meta || resData?.metadata),
          timeTakenMs,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        return {
          status: 'success',
          statusCode,
          message,
          data,
          error: null,
          meta,
        } as ApiResponse<T>;
      }),
    );
  }
}
