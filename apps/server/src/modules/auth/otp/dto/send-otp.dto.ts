import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SendOtpDto {
  @ApiProperty({ description: 'Email address', example: 'admin@warranty.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email: string;

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
