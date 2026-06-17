// src/modules/branch/dto/organization-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type as TransformerType } from 'class-transformer';
import { plainToInstance } from 'class-transformer';
import { OrganizationType } from 'generated/prisma/enums';

@Exclude()
export class OrganizationResponseDto {
  @ApiProperty({ description: 'Organization ID', example: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Organization display name',
    example: 'Acme Corp',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Registered company name',
    example: 'Acme Corporation Ltd',
  })
  @Expose()
  companyName: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'acme-corp' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({ description: 'Organization logo URL' })
  @Expose()
  logo?: string;

  @ApiProperty({
    description: 'Organization type',
    enum: OrganizationType,
    example: 'ROOT',
  })
  @Expose()
  type: string;

  @ApiProperty({ description: 'Active status', example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Root organization ID (for branches)' })
  @Expose()
  rootId?: string;

  @ApiPropertyOptional({ description: 'Parent organization ID (for branches)' })
  @Expose()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Creator user ID' })
  @Expose()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Last updater user ID' })
  @Expose()
  updatedBy?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Child branches',
    type: () => [OrganizationResponseDto],
  })
  @Expose()
  @TransformerType(() => OrganizationResponseDto)
  children?: OrganizationResponseDto[];

  @ApiPropertyOptional({
    description: 'Branch count statistics',
  })
  @Expose()
  _count?: {
    children: number;
    userAccesses: number;
  };

  static fromEntity(entity: any): OrganizationResponseDto {
    return plainToInstance(OrganizationResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): OrganizationResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
