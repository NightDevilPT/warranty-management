import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'The first name of the user',
    example: 'John',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the user',
    example: 'Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email format' })
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+1234567890',
    type: String,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'The global system role of the user',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  @Type(() => String)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Master switch to completely deactivate a user platform-wide',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // Handle string "true"/"false" from multipart form data
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value; // Let IsBoolean validator handle invalid values
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Manual override to mark an email as verified',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // Handle string "true"/"false" from multipart form data
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value; // Let IsBoolean validator handle invalid values
  })
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Manual override to mark a phone number as verified',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // Handle string "true"/"false" from multipart form data
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value; // Let IsBoolean validator handle invalid values
  })
  phoneVerified?: boolean;

  // Add this for file upload support
  @ApiPropertyOptional({
    description: 'Profile picture file',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profilePicture?: any;
}
