// src/modules/org-user/dto/add-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsIn,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddUserDto {
  @ApiPropertyOptional({
    description: 'Email of user to add',
    example: 'john@example.com',
  })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail(
    {},
    { message: 'Valid email is required when phone is not provided' },
  )
  @Type(() => String)
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of user to add',
    example: '+1234567890',
  })
  @ValidateIf((o) => !o.email)
  @IsString()
  @Type(() => String)
  phoneNumber?: string;

  @ApiProperty({
    description: 'Role in organization',
    enum: [
      'COMPANY_SUPER_ADMIN',
      'COMPANY_STAFF',
      'COMPANY_PARTNER',
      'CONSUMER',
    ],
    example: 'COMPANY_STAFF',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsString()
  @IsIn(['COMPANY_SUPER_ADMIN', 'COMPANY_STAFF', 'COMPANY_PARTNER', 'CONSUMER'])
  @Type(() => String)
  role: string;

  @ApiProperty({
    description:
      'Portal type - STAFF (internal dashboard) or CONSUMER (public portal)',
    enum: ['STAFF', 'CONSUMER'],
    example: 'STAFF',
  })
  @IsNotEmpty({ message: 'Portal type is required' })
  @IsString()
  @IsIn(['STAFF', 'CONSUMER'])
  @Type(() => String)
  portalType: string;

  @ApiPropertyOptional({
    description: 'Partner type - INTERNAL (employee) or EXTERNAL (partner)',
    enum: ['INTERNAL', 'EXTERNAL'],
    example: 'INTERNAL',
  })
  @IsOptional()
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'])
  @Type(() => String)
  partnerType?: string;

  @ApiPropertyOptional({
    description: 'DealerType ID for role template assignment',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid dealer type ID' })
  @Type(() => String)
  dealerTypeId?: string;

  @ApiPropertyOptional({
    description: 'Array of feature IDs to assign to user',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Invalid feature ID format' })
  @Type(() => String)
  featureIds?: string[];
}
