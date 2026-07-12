import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User role', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  @Type(() => String)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Partner type',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  partnerType?: string;

  @ApiPropertyOptional({ description: 'Dealer type ID' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  dealerTypeId?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
