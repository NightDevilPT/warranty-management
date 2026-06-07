import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'Pawan',
    type: String,
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Type(() => String)
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Kumar',
    type: String,
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({
    description:
      'The email address of the user (Required if no phone number is provided)',
    example: 'pawankumartadagsingh@gmail.com',
    type: String,
  })
  @ValidateIf((o) => !o.phoneNumber || o.email) // Fix validation logic
  @IsEmail(
    {},
    { message: 'Must provide a valid email if no phone number is given' },
  )
  @IsOptional() // Change to IsOptional since it's conditionally required
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description:
      'The phone number of the user (Required if no email is provided)',
    example: '+1234567890',
    type: String,
  })
  @ValidateIf((o) => !o.email || o.phoneNumber) // Fix validation logic
  @IsString()
  @IsOptional() // Change to IsOptional since it's conditionally required
  @Type(() => String)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'The password for standard login',
    example: 'StrongP@ss123',
    minLength: 8,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Type(() => String)
  password?: string;

  @ApiPropertyOptional({
    description: 'The global system role of the user',
    enum: UserRole,
    default: UserRole.CONSUMER,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  @Type(() => String)
  role?: UserRole;
}
