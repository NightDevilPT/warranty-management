// src/modules/organization/dto/organization-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class OrganizationResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: 'clx1234567890abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Acme North America',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Official company name',
    example: 'Acme Corporation Ltd.',
  })
  @Expose()
  companyName: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'acme',
  })
  @Expose()
  slug: string;

  @ApiProperty({
    description: 'Organization type',
    example: 'ROOT',
  })
  @Expose()
  type: string;

  @ApiPropertyOptional({
    description: 'Enabled modules JSON',
    example: { products: true, claims: false },
  })
  @Expose()
  enabledModules?: any;

  @ApiProperty({
    description: 'Whether organization is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  static fromEntity(org: any): OrganizationResponseDto {
    return plainToInstance(OrganizationResponseDto, org, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(orgs: any[]): OrganizationResponseDto[] {
    return orgs.map((org) => this.fromEntity(org));
  }
}
