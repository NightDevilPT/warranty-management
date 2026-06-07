// src/modules/auth/dto/verify-otp.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OtpType } from 'generated/prisma/enums';

export class VerifyOtpDto {
  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @ValidateIf((o) => !o.email)
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiProperty({
    description: 'OTP code received',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'OTP type/purpose',
    enum: OtpType,
    example: 'LOGIN',
  })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;
}
