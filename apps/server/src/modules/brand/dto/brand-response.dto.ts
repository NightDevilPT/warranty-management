// src/modules/brand/dto/brand-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type as TransformerType } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
class OrganizationInfo {
  @ApiProperty({ description: 'Organization name' })
  @Expose()
  name: string;
}

@Exclude()
export class BrandResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Brand name', example: 'Samsung' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'samsung' })
  @Expose()
  slug: string;

  @ApiPropertyOptional({
    description: 'Brand description',
    example: 'Leading electronics manufacturer',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo URL' })
  @Expose()
  logo?: string;

  @ApiPropertyOptional({
    description: 'Brand website URL',
    example: 'https://www.samsung.com',
  })
  @Expose()
  website?: string;

  @ApiProperty({ description: 'Active status', example: true })
  @Expose()
  isActive: boolean;

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
    description: 'Organization name',
    example: 'Acme Corp',
  })
  @Expose()
  @TransformerType(() => OrganizationInfo)
  organization?: OrganizationInfo;

  static fromEntity(entity: any): BrandResponseDto {
    return plainToInstance(BrandResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): BrandResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
