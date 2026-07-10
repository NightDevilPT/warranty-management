// src/middleware/guards/jwt-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ErrorService } from 'services/errors/error.service';
import { JwtService } from 'services/jwt/jwt.service';
import { LoggerService } from 'services/logger/logger.service';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        phoneNumber?: string;
        role: string;
        orgId?: string;
        orgSlug?: string;
        portalType?: string;
        permissions?: string[];
        partnerType?: string;
        dealerTypeId?: string;
        isAdminView?: boolean;
      };
    }
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(JwtAuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessToken = request.cookies?.accessToken || null;
    const refreshToken = request.cookies?.refreshToken || null;
    const isLogoutRequest = request.url?.includes('/auth/logout');

    // --- Logout Flow ---
    if (isLogoutRequest) {
      if (!accessToken && !refreshToken) {
        response.clearCookie('accessToken', { path: '/' });
        response.clearCookie('refreshToken', { path: '/' });
        return true;
      }

      if (accessToken) {
        const decoded = this.jwtService.decodeToken(accessToken);
        if (decoded?.sub) {
          request.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          };
          return true;
        }
      }
      request.user = { id: 'unknown', role: 'CONSUMER' };
      return true;
    }

    // --- Normal Flow ---
    if (!accessToken && !refreshToken) {
      throw this.errorService.unauthorized(
        'Authentication required. Please login.',
      );
    }

    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAccessToken(accessToken);
        // Attach full user context from JWT
        request.user = {
          id: payload.sub,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
          orgId: payload.orgId,
          orgSlug: payload.orgSlug,
          portalType: payload.portalType,
          permissions: payload.permissions || [],
        };
        return true;
      } catch (accessError) {
        this.logger.debug('Access token failed, trying refresh');
      }
    }

    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken);
        const newTokens = await this.jwtService.generateTokenPair({
          sub: payload.sub,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
        });

        const isProd = process.env.NODE_ENV === 'production';
        response.cookie('accessToken', newTokens.accessToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'strict' : 'lax',
          path: '/',
          maxAge: 15 * 60 * 1000,
        });
        response.cookie('refreshToken', newTokens.refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'strict' : 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        request.user = {
          id: payload.sub,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          role: payload.role,
        };
        return true;
      } catch (refreshError) {
        response.clearCookie('accessToken', { path: '/' });
        response.clearCookie('refreshToken', { path: '/' });
        throw this.errorService.unauthorized(
          'Session expired. Please login again.',
        );
      }
    }

    throw this.errorService.unauthorized(
      'Access token expired. Please login again.',
    );
  }
}
