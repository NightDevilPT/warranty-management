// src/modules/auth/dto/send-otp.dto.ts
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

export class SendOtpDto {
  @ApiPropertyOptional({
    description: 'Email address to send OTP',
    example: 'john.doe@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number to send OTP',
    example: '+919876543210',
  })
  @ValidateIf((o) => !o.email)
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiProperty({
    description: 'OTP type/purpose',
    enum: OtpType,
    example: 'LOGIN',
  })
  @IsNotEmpty()
  @IsEnum(OtpType)
  type: OtpType;
}
