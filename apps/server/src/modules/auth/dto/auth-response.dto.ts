// src/modules/auth/dto/auth-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class AuthResponseDto {
  @ApiProperty({
    description: 'User details',
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiPropertyOptional({
    description: 'JWT Access Token (set as HTTP-only cookie)',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken?: string;

  @ApiPropertyOptional({
    description: 'JWT Refresh Token (set as HTTP-only cookie)',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Whether OTP is required for login',
    example: false,
  })
  requiresOtp?: boolean;

  static fromLogin(
    user: any,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.user = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    dto.accessToken = accessToken;
    dto.refreshToken = refreshToken;
    return dto;
  }

  static otpRequired(userId: string, message: string): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.user = { id: userId } as any;
    dto.requiresOtp = true;
    return dto;
  }

  static otpSent(message: string): {
    data: { message: string };
    message: string;
  } {
    return {
      data: { message },
      message: 'OTP sent successfully',
    };
  }
}
