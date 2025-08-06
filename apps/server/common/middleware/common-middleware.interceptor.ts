import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';
import { IApiResponse } from 'interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<IApiResponse<T>> {
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
        const { ...data } = {
          ...(resData?.data ?? resData ?? {}),
        };

        const accessToken = resData?.accessToken || null;
        const refreshToken = resData?.refreshToken || null;

        if (accessToken) {
          response.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: ACCESS_TOKEN_AGE,
          });
        }
        if (refreshToken) {
          response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: REFRESH_TOKEN_AGE,
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
        } as IApiResponse<T>;
      }),
    );
  }
}
