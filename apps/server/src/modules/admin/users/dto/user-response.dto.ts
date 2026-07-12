import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Exclude,
  Expose,
  plainToInstance,
  Type as CTType,
} from 'class-transformer';

@Exclude()
class UserDealerTypeDto {
  @ApiProperty({ description: 'Dealer type ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Dealer type name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Partner type' })
  @Expose()
  partnerType: string;
}

@Exclude()
class PermissionByModuleDto {
  @ApiProperty({ description: 'Module ID' })
  @Expose()
  moduleId: string;

  @ApiProperty({ description: 'Module name' })
  @Expose()
  moduleName: string;

  @ApiProperty({ description: 'Module icon' })
  @Expose()
  moduleIcon: string;

  @ApiProperty({ description: 'Permissions in this module' })
  @Expose()
  permissions: {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
  }[];
}

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'UserAccess ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'First name' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({ description: 'Role' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Partner type' })
  @Expose()
  partnerType: string;

  @ApiProperty({ description: 'Active status' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Dealer type' })
  @Expose()
  @CTType(() => UserDealerTypeDto)
  dealerType?: UserDealerTypeDto;

  @ApiProperty({ description: 'Email verified' })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({ description: 'Phone verified' })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({ description: 'Created at' })
  @Expose()
  createdAt: Date;

  static fromEntity(entity: any): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  static fromEntities(entities: any[]): UserResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

@Exclude()
export class UserDetailDto extends UserResponseDto {
  @ApiProperty({
    description: 'Effective permissions grouped by module',
    type: [PermissionByModuleDto],
  })
  @Expose()
  @CTType(() => PermissionByModuleDto)
  permissions: PermissionByModuleDto[] | string;

  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @Expose()
  profile?: string;
}

@Exclude()
export class InviteUserResponseDto {
  @ApiProperty({ description: 'User ID' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'UserAccess ID' })
  @Expose()
  userAccessId: string;

  @ApiProperty({ description: 'Email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Full name' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Role' })
  @Expose()
  role: string;

  @ApiPropertyOptional({ description: 'Dealer type name' })
  @Expose()
  dealerType?: string;

  @ApiProperty({ description: 'Invitation sent' })
  @Expose()
  invitationSent: boolean;
}

@Exclude()
export class UserPermissionsResponseDto {
  @ApiProperty({
    description: 'Permissions grouped by module or FULL_ACCESS',
    type: [PermissionByModuleDto],
  })
  @Expose()
  @CTType(() => PermissionByModuleDto)
  permissions: PermissionByModuleDto[] | string;
}

@Exclude()
export class ChangeDealerTypeResponseDto {
  @ApiProperty({ description: 'Success message' })
  @Expose()
  message: string;

  @ApiPropertyOptional({ description: 'Previous dealer type name' })
  @Expose()
  previousDealerType?: string;

  @ApiPropertyOptional({ description: 'New dealer type name' })
  @Expose()
  newDealerType?: string;
}
