// src/modules/organization/dto/create-organization.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Display name of the organization',
    example: 'Acme North America',
    type: String,
  })
  @IsNotEmpty({ message: 'Organization name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Official registered company name',
    example: 'Acme Corporation Ltd.',
    type: String,
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @Type(() => String)
  companyName: string;

  @ApiProperty({
    description: 'URL-friendly slug for path-based routing (e.g., acme)',
    example: 'acme',
    type: String,
  })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase alphanumeric with hyphens (e.g., acme-corp)',
  })
  @Type(() => String)
  slug: string;

  @ApiPropertyOptional({
    description: 'Organization type (defaults to ROOT)',
    example: 'ROOT',
    enum: ['ROOT', 'BRANCH'],
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  type?: string;
}
