import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class InviteUserDto {
  @ApiProperty({ description: 'Email address', example: 'john@techserve.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @Type(() => String)
  email: string;

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

  @ApiProperty({ description: 'User role', enum: UserRole })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Invalid role' })
  @Type(() => String)
  role: UserRole;

  @ApiProperty({ description: 'Partner type', enum: ['INTERNAL', 'EXTERNAL'] })
  @IsNotEmpty({ message: 'Partner type is required' })
  @IsString()
  @Type(() => String)
  partnerType: string;

  @ApiPropertyOptional({ description: 'Dealer type ID for role template' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  dealerTypeId?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+919876543210',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  phoneNumber?: string;
}
