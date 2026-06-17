// src/modules/org-user/dto/update-org-user.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrgUserDto {
  @ApiPropertyOptional({
    description: 'Role in organization',
    enum: [
      'COMPANY_SUPER_ADMIN',
      'COMPANY_STAFF',
      'COMPANY_PARTNER',
      'CONSUMER',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(['COMPANY_SUPER_ADMIN', 'COMPANY_STAFF', 'COMPANY_PARTNER', 'CONSUMER'])
  @Type(() => String)
  role?: string;

  @ApiPropertyOptional({
    description: 'Portal type',
    enum: ['STAFF', 'CONSUMER'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['STAFF', 'CONSUMER'])
  @Type(() => String)
  portalType?: string;

  @ApiPropertyOptional({
    description: 'Partner type',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'])
  @Type(() => String)
  partnerType?: string;

  @ApiPropertyOptional({
    description: 'DealerType ID',
  })
  @IsOptional()
  @IsUUID('4')
  @Type(() => String)
  dealerTypeId?: string;
}
