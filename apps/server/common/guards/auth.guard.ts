// src/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtPayload, TokenExpiration } from 'interfaces/jwt.interface';
import { JwtTokenService } from 'services/jwt-token-service/index.service';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse<Response>();

    try {
      // Try to verify access token first
      const accessToken = req.cookies['accessToken'];
      const accessPayload =
        this.jwtService.verifyToken<JwtPayload>(accessToken);

      if (accessPayload) {
        req.user = accessPayload;
        return true;
      }

      // If access token is invalid/expired, try refresh token
      const refreshToken = req.cookies['refreshToken'];
      const refreshPayload =
        this.jwtService.verifyToken<JwtPayload>(refreshToken);

      if (!refreshPayload) {
        throw new UnauthorizedException('Both tokens expired or invalid');
      }

      // Generate new tokens with the same payload structure
      const newAccessToken = this.jwtService.generateAccessToken<JwtPayload>({
        sub: refreshPayload.sub,
        email: refreshPayload.email,
        roles: refreshPayload.roles,
      });

      const newRefreshToken = this.jwtService.generateRefreshToken<JwtPayload>({
        sub: refreshPayload.sub,
        email: refreshPayload.email,
        roles: refreshPayload.roles,
      });

      // Set new cookies
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.getMaxAge(TokenExpiration.ACCESS_TOKEN),
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.getMaxAge(TokenExpiration.REFRESH_TOKEN),
      });

      req.user = refreshPayload;
      return true;
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      throw new UnauthorizedException('Invalid authentication credentials');
    }
  }

  private getMaxAge(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
      case 's':
        return value * 1000; // seconds
      case 'm':
        return value * 60 * 1000; // minutes
      case 'h':
        return value * 60 * 60 * 1000; // hours
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days
      default:
        return 15 * 60 * 1000; // default 15 minutes
    }
  }
}
