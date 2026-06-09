import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({ description: 'First name', example: 'John' })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'user@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Invalid email format' })
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

  @ApiPropertyOptional({
    description: 'Password (optional, can use OTP)',
    example: 'StrongP@ss123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @Type(() => String)
  password?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.CONSUMER,
    example: UserRole.CONSUMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
