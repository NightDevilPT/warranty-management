// src/services/jwt/jwt.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'services/logger/logger.service';
import { ErrorService } from 'services/errors/error.service';

export interface JwtPayload {
  sub: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  type?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService implements OnModuleInit {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(JwtService.name);
  }

  onModuleInit() {
    // Validate that secrets are configured
    const accessSecret = this.configService.get('jwt.accessSecret');
    const refreshSecret = this.configService.get('jwt.refreshSecret');

    if (!accessSecret) {
      this.logger.error('JWT access secret is not configured');
      throw new Error(
        'JWT_ACCESS_SECRET or JWT_SECRET must be set in environment variables',
      );
    }

    if (!refreshSecret) {
      this.logger.error('JWT refresh secret is not configured');
      throw new Error(
        'JWT_REFRESH_SECRET or JWT_SECRET must be set in environment variables',
      );
    }

    this.logger.log('JWT Service initialized successfully');
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    this.logger.log('Generating token pair', undefined, {
      userId: payload.sub,
      role: payload.role,
    });

    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(payload),
        this.generateRefreshToken(payload),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        'Failed to generate token pair',
        error.stack,
        undefined,
        {
          userId: payload.sub,
          error: error.message,
        },
      );
      throw this.errorService.internalServerError(
        'Failed to generate authentication tokens',
      );
    }
  }

  /**
   * Generate access token (short-lived)
   */
  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const tokenPayload = {
      ...payload,
      type: 'access' as const,
    };

    const secret = this.configService.get('jwt.accessSecret');
    const expiresIn = this.configService.get('jwt.accessExpireIn', '15m');

    if (!secret) {
      throw this.errorService.internalServerError(
        'JWT access secret is not configured',
      );
    }

    return this.jwtService.signAsync(tokenPayload, {
      secret,
      expiresIn,
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const tokenPayload = {
      ...payload,
      type: 'refresh' as const,
    };

    const secret = this.configService.get('jwt.refreshSecret');
    const expiresIn = this.configService.get('jwt.refreshExpireIn', '7d');

    if (!secret) {
      throw this.errorService.internalServerError(
        'JWT refresh secret is not configured',
      );
    }

    return this.jwtService.signAsync(tokenPayload, {
      secret,
      expiresIn,
    });
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get('jwt.accessSecret');

      if (!secret) {
        throw this.errorService.internalServerError(
          'JWT access secret is not configured',
        );
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      if (payload.type && payload.type !== 'access') {
        throw this.errorService.unauthorized('Invalid token type');
      }

      this.logger.debug('Access token verified', undefined, {
        userId: payload.sub,
      });

      return payload;
    } catch (error) {
      if (error.status) throw error;

      if (error.name === 'TokenExpiredError') {
        throw this.errorService.unauthorized('Access token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw this.errorService.unauthorized('Invalid access token');
      }

      this.logger.error('Access token verification failed', error.stack);
      throw this.errorService.unauthorized('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get('jwt.refreshSecret');

      if (!secret) {
        throw this.errorService.internalServerError(
          'JWT refresh secret is not configured',
        );
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      if (payload.type && payload.type !== 'refresh') {
        throw this.errorService.unauthorized('Invalid token type');
      }

      this.logger.debug('Refresh token verified', undefined, {
        userId: payload.sub,
      });

      return payload;
    } catch (error) {
      if (error.status) throw error;

      if (error.name === 'TokenExpiredError') {
        throw this.errorService.unauthorized('Refresh token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw this.errorService.unauthorized('Invalid refresh token');
      }

      this.logger.error('Refresh token verification failed', error.stack);
      throw this.errorService.unauthorized('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for extracting user info)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = this.jwtService.decode(token) as JwtPayload;
      return decoded || null;
    } catch (error) {
      this.logger.warn('Failed to decode token', undefined, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Refresh token pair using a valid refresh token
   */
  async refreshTokenPair(refreshToken: string): Promise<TokenPair> {
    this.logger.log('Refreshing token pair');

    const payload = await this.verifyRefreshToken(refreshToken);

    // Generate new token pair
    const newPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
    };

    this.logger.log('Token pair refreshed successfully', undefined, {
      userId: payload.sub,
    });

    return this.generateTokenPair(newPayload);
  }
}
