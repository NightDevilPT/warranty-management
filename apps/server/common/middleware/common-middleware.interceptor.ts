import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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

    const ACCESS_TOKEN_AGE = 10 * 60 * 1000; // 10 mins
    const REFRESH_TOKEN_AGE = 12 * 60 * 1000; // 12 mins
    const startTime = Date.now(); // ⏱️ Start measuring time

    return next.handle().pipe(
      map((resData: any) => {
        const endTime = Date.now(); // ⏱️ End time
        const timeTakenMs = endTime - startTime;

        const statusCode = resData?.statusCode || response.statusCode || 200;

        // ✅ Safe destructuring
        const { accessToken, refreshToken, ...data } = {
          ...(resData?.data ?? resData ?? {}),
        };

        if (accessToken) {
          response.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ACCESS_TOKEN_AGE,
          });
        }

        if (refreshToken) {
          response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_AGE,
          });
        }

        const message = resData?.message || 'Request completed successfully';
        const meta = {
          ...(resData?.meta || resData?.metadata),
          timeTakenMs, // ⏱️ Include execution time
          timestamp: new Date().toISOString(),
          path: request.url,
        };
        console.log(
          `Response Interceptor: ${request.method} ${request.url} - ${statusCode} - ${message} - ${timeTakenMs}ms`,
        );

        const formattedResponse: ApiResponse<T> = {
          status: 'success',
          statusCode,
          message,
          data,
          meta,
        };

        // Return the formatted response object directly (let Nest handle response sending)
        return formattedResponse;
      }),
    );
  }
}
