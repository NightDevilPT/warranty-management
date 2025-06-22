// src/common/services/jwt-token.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenExpiration } from 'interfaces/jwt.interface';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  // Internal method to generate token with expiration & secret
  private _generateToken<T extends object>(
    payload: T,
    secret: string,
    expiresIn: string,
  ): string {
    const options: JwtSignOptions = { expiresIn, secret };
    return this.jwtService.sign(payload, options);
  }

  // Public method to verify token with secret
  verifyToken<T extends object>(token: string): T | null {
    try {
      return this.jwtService.verify<T>(token, {
        secret: process.env.JWT_SECRET!,
      });
    } catch {
      return null;
    }
  }

  // Decode token without verification
  decodeToken<T = any>(token: string): T | null {
    try {
      return this.jwtService.decode(token) as T;
    } catch {
      return null;
    }
  }

  // Public methods for each token type
  generateAccessToken<T extends object>(payload: T): string {
    return this._generateToken(
      payload,
      process.env.JWT_SECRET!,
      TokenExpiration.ACCESS_TOKEN,
    );
  }

  generateRefreshToken<T extends object>(payload: T): string {
    return this._generateToken(
      payload,
      process.env.JWT_SECRET!,
      TokenExpiration.REFRESH_TOKEN,
    );
  }

  generatePasswordResetToken<T extends object>(payload: T): string {
    return this._generateToken(
      payload,
      process.env.JWT_SECRET!,
      TokenExpiration.PASSWORD_RESET,
    );
  }

  generateEmailVerificationToken<T extends object>(payload: T): string {
    return this._generateToken(
      payload,
      process.env.JWT_SECRET!,
      TokenExpiration.EMAIL_VERIFICATION,
    );
  }

  // Attach cookie tokens to response
  generateCookieTokens(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.ms(TokenExpiration.ACCESS_TOKEN),
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.ms(TokenExpiration.REFRESH_TOKEN),
    });
  }

  // Convert string durations like '10m', '7d', etc. to ms
  private ms(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));
    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }
}
