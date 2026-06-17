// src/modules/branch/dto/update-branch.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBranchDto {
  @ApiPropertyOptional({
    description: 'Branch organization name',
    example: 'Acme North Region Updated',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Official registered company name',
    example: 'Acme North Region Pvt Ltd',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Branch description',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'Active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Branch logo URL',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid URL format' })
  @Type(() => String)
  logo?: string;
}
