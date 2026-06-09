import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { OrganizationType } from 'generated/prisma/enums';

@Exclude()
export class OrganizationResponseDto {
  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Display name', example: 'Acme Corporation' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Registered business name',
    example: 'Acme Corporation Pvt Ltd',
  })
  @Expose()
  companyName: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'acme-corporation',
  })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: 'Logo URL',
    example: 'organizations/acme-logo-123.jpg',
  })
  @Expose()
  logo?: string;

  @ApiProperty({ description: 'Organization type', enum: OrganizationType })
  @Expose()
  type: OrganizationType;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Root organization ID (for branches)' })
  @Expose()
  rootId?: string;

  @ApiPropertyOptional({ description: 'Parent organization ID (for branches)' })
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Admin who created this org' })
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Admin who last updated this org' })
  @Expose()
  updatedBy?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): OrganizationResponseDto {
    return plainToInstance(OrganizationResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): OrganizationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
