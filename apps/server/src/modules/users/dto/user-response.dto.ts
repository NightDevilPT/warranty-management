// apps/server/src/modules/users/dto/user-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from 'generated/prisma/enums';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'clx1234567890abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'The full name of the user (auto-generated)',
    example: 'John Doe',
  })
  @Expose()
  fullName: string;

  @ApiPropertyOptional({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @Expose()
  email?: string | null;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
    example: '+1234567890',
  })
  @Expose()
  phoneNumber?: string | null;

  @ApiProperty({
    description: 'The global system role of the user',
    enum: UserRole,
    example: UserRole.CONSUMER,
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the email has been verified',
    example: false,
  })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({
    description: 'Whether the phone number has been verified',
    example: false,
  })
  @Expose()
  phoneVerified: boolean;

  @ApiProperty({
    description: 'User profile picture',
    example: 'profile-picture.jpg',
  })
  @Expose()
  profile?: string | null;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  // Static factory method
  static fromEntity(user: any): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // For multiple users
  static fromEntities(users: any[]): UserResponseDto[] {
    return users.map((user) => this.fromEntity(user));
  }
}

// Import at the top
import { plainToInstance } from 'class-transformer';
