// src/modules/org-user/dto/org-user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type as TransformerType } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

@Exclude()
export class OrgUserResponseDto {
  @ApiProperty({ description: 'UserAccess ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Role in organization' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Portal type' })
  @Expose()
  portalType: string;

  @ApiPropertyOptional({ description: 'Partner type' })
  @Expose()
  partnerType?: string;

  @ApiPropertyOptional({ description: 'DealerType ID' })
  @Expose()
  dealerTypeId?: string;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'User details' })
  @Expose()
  @TransformerType(() => Object)
  user?: {
    id: string;
    email?: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profile?: string;
    isActive: boolean;
  };

  @ApiPropertyOptional({ description: 'Organization details' })
  @Expose()
  @TransformerType(() => Object)
  organization?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiPropertyOptional({ description: 'DealerType details' })
  @Expose()
  @TransformerType(() => Object)
  dealerType?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Assigned features' })
  @Expose()
  @TransformerType(() => Array)
  features?: Array<{
    id: string;
    name: string;
    code: string;
    isActive: boolean;
  }>;

  static fromEntity(entity: any): OrgUserResponseDto {
    return plainToInstance(OrgUserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): OrgUserResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
