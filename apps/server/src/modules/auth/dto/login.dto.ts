// src/modules/auth/dto/login.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email address for email/password login',
    example: 'john.doe@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number for OTP login',
    example: '+919876543210',
  })
  @ValidateIf((o) => !o.email)
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description:
      'Password for email/password login. Required if using email login.',
    example: 'SecurePassword@123',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  password?: string;
}
