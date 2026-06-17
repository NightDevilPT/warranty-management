// src/modules/branch/dto/create-branch.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Branch organization name',
    example: 'Acme North Region',
  })
  @IsNotEmpty({ message: 'Branch name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Official registered company name for legal documents',
    example: 'Acme North Region Pvt Ltd',
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @Type(() => String)
  companyName: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug for this branch',
    example: 'acme-north',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Branch description or additional info',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'Branch logo URL',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid URL format' })
  @Type(() => String)
  logo?: string;
}
