// src/guards/jwt-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { GuardRequest, UserPayload } from 'interfaces/jwt-payload.interface';
import { JwtTokenService } from 'services/jwt-token-service/index.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<GuardRequest>();
    const res = ctx.getResponse<Response>();

    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];

    const user = this.jwtService.verifyToken<UserPayload>(accessToken);

    if (user) {
      req.user = user;
      return true;
    }

    const refreshPayload =
      this.jwtService.verifyToken<UserPayload>(refreshToken);

    if (!refreshPayload) {
      throw new UnauthorizedException('Both tokens expired or invalid');
    }

    const newAccessToken = this.jwtService.generateAccessToken<UserPayload>({
      userId: refreshPayload.userId,
    });

    const newRefreshToken = this.jwtService.generateRefreshToken<UserPayload>({
      userId: refreshPayload.userId,
    });

    this.jwtService.generateCookieTokens(res, newAccessToken, newRefreshToken);

    req.user = refreshPayload;

    return true;
  }
}
