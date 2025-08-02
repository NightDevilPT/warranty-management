import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger'; // optional, remove if not using swagger
import { ROLES } from '../interface/user.interface';

export class UserResponseDto {
  @ApiProperty()
  readonly id: string; // mapped from _id

  @ApiProperty()
  readonly firstName: string;

  @ApiProperty()
  readonly lastName: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty({ nullable: true })
  readonly avatar?: string | null;

  @ApiProperty()
  readonly contact: string;

  @ApiProperty({ enum: ROLES })
  readonly role: ROLES;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  constructor(user: any) {
    this.id = (user._id || user.id)?.toString();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.avatar = user.avatar ?? null;
    this.contact = user.contact;
    this.role = user.role;

    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
