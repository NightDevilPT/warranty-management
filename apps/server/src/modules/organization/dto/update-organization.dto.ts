import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'Acme Corporation Updated',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Registered business name',
    example: 'Acme Corporation Pvt Ltd',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  companyName?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug',
    example: 'acme-corporation-updated',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @Type(() => String)
  slug?: string;

  @ApiPropertyOptional({ description: 'Active status', example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
