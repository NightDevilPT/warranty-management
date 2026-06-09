import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email address for login',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number for login',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Password for password-based login',
    example: 'StrongP@ss123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Type(() => String)
  password?: string;

  @ApiPropertyOptional({
    description: 'OTP code for passwordless login',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  otp?: string;
}
