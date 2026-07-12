import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class InviteSuperAdminDto {
  @ApiProperty({ description: 'Email address', example: 'admin@techserve.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email: string;

  @ApiProperty({ description: 'First name', example: 'Raj' })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Sharma' })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;
}
