import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class FeatureByModuleDto {
  @ApiProperty({ description: 'Module ID' })
  @Expose()
  moduleId: string;

  @ApiProperty({ description: 'Module name' })
  @Expose()
  moduleName: string;

  @ApiProperty({ description: 'Module code' })
  @Expose()
  moduleCode: string;

  @ApiProperty({ description: 'Module icon' })
  @Expose()
  moduleIcon: string;

  @ApiProperty({ description: 'Features in this module' })
  @Expose()
  features: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
  }[];
}

@Exclude()
class AssignedUserDto {
  @ApiProperty({ description: 'UserAccess ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Role' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;
}

@Exclude()
export class DealerTypeResponseDto {
  @ApiProperty({ description: 'DealerType ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Expose()
  orgId: string;

  @ApiProperty({ description: 'Role template name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Partner type' })
  @Expose()
  partnerType: string;

  @ApiPropertyOptional({ description: 'Description' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
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

@Exclude()
class DealerTypeListItemDto extends DealerTypeResponseDto {
  @ApiProperty({ description: 'Number of assigned features' })
  @Expose()
  featuresCount: number;

  @ApiProperty({ description: 'Number of assigned users' })
  @Expose()
  usersCount: number;
}

@Exclude()
export class DealerTypeDetailDto extends DealerTypeResponseDto {
  @ApiProperty({
    description: 'Features grouped by module',
    type: [FeatureByModuleDto],
  })
  @Expose()
  @CTType(() => FeatureByModuleDto)
  features: FeatureByModuleDto[];

  @ApiProperty({
    description: 'Users assigned to this role',
    type: [AssignedUserDto],
  })
  @Expose()
  @CTType(() => AssignedUserDto)
  users: AssignedUserDto[];

  @ApiProperty({ description: 'Number of assigned features' })
  @Expose()
  featuresCount: number;

  @ApiProperty({ description: 'Number of assigned users' })
  @Expose()
  usersCount: number;
}

@Exclude()
export class PermissionsResponseDto {
  @ApiProperty({
    description: 'Features grouped by module',
    type: [FeatureByModuleDto],
  })
  @Expose()
  @CTType(() => FeatureByModuleDto)
  features: FeatureByModuleDto[];
}

@Exclude()
export class UpdatePermissionsResponseDto {
  @ApiProperty({ description: 'Success message' })
  @Expose()
  message: string;

  @ApiProperty({ description: 'Number of features assigned' })
  @Expose()
  assignedCount: number;
}
