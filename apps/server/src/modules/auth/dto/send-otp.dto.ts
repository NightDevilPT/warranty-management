import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OtpType } from 'generated/prisma/enums';

export class SendOtpDto {
  @ApiPropertyOptional({
    description: 'Email address for OTP',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number for OTP',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiProperty({
    description: 'OTP type',
    enum: OtpType,
    example: OtpType.LOGIN,
  })
  @IsNotEmpty({ message: 'OTP type is required' })
  @IsEnum(OtpType)
  type: OtpType;
}
