import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class DealerTypeResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID this dealer type belongs to' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Display name', example: 'Support Agent' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Partner type',
    example: 'INTERNAL',
    enum: ['INTERNAL', 'EXTERNAL'],
  })
  @Expose()
  partnerType: string;

  @ApiPropertyOptional({ description: 'Role description' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'User count assigned to this dealer type',
  })
  @Expose()
  userCount?: number;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @Expose()
  createdBy?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: any): DealerTypeResponseDto {
    return plainToInstance(DealerTypeResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): DealerTypeResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
