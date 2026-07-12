import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class SendOtpResponseDto {
  @ApiProperty({ description: 'Success message' })
  @Expose()
  message: string;

  @ApiProperty({ description: 'OTP expiry in seconds' })
  @Expose()
  expiresIn: number;

  @ApiPropertyOptional({
    description: 'True if new consumer account was created',
  })
  @Expose()
  isNewUser?: boolean;

  @ApiPropertyOptional({
    description: 'OTP code (only returned in development)',
  })
  @Expose()
  otp?: string;

  static from(data: any): SendOtpResponseDto {
    return plainToInstance(SendOtpResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

@Exclude()
export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  @Expose()
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  @Expose()
  refreshToken: string;

  @ApiProperty({ description: 'User info' })
  @Expose()
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    profile: string | null;
  };

  @ApiProperty({ description: 'Organization info' })
  @Expose()
  org: {
    id: string;
    name: string;
    hash: string;
  };

  @ApiProperty({ description: 'Portal type' })
  @Expose()
  portalType: string;

  @ApiProperty({ description: 'Feature permissions' })
  @Expose()
  permissions: string[];

  static from(data: any): VerifyOtpResponseDto {
    return plainToInstance(VerifyOtpResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
