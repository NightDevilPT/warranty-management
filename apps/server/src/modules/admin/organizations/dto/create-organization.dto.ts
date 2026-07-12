import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationType } from 'generated/prisma/enums';

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Display name', example: 'TechServe India' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Legal company name',
    example: 'TechServe India Private Limited',
  })
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @Type(() => String)
  companyName: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'techserve' })
  @IsNotEmpty({ message: 'Slug is required' })
  @IsString()
  @Type(() => String)
  slug: string;

  @ApiPropertyOptional({
    description: 'Organization type',
    enum: OrganizationType,
    default: 'ROOT',
  })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @Type(() => String)
  logo?: string;
}
