import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email address', example: 'admin@warranty.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email: string;

  @ApiProperty({ description: '6-digit OTP code', example: 123456 })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsInt({ message: 'OTP must be a number' })
  @Min(100000, { message: 'OTP must be 6 digits' })
  @Max(999999, { message: 'OTP must be 6 digits' })
  @Type(() => Number)
  otp: number;

  @ApiPropertyOptional({
    description:
      'Organization hash (required for company/consumer, not needed for admin)',
    example: 'admin01',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  orgHash?: string;
}
