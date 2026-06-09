import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Display name', example: 'Acme Corporation' })
  @IsNotEmpty({ message: 'Organization name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Registered business name',
    example: 'Acme Corporation Pvt Ltd',
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @Type(() => String)
  companyName: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated if not provided)',
    example: 'acme-corporation',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  @Type(() => String)
  slug?: string;
}
