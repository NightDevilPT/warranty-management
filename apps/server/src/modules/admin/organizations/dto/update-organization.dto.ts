import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({
    description: 'Display name',
    example: 'TechServe India Updated',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({ description: 'Legal company name' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  companyName?: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  slug?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  logo?: string;
}
