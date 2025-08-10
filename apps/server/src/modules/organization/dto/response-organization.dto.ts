// src/modules/organization/dto/response-organization.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  parentId: string | null;

  @ApiProperty()
  rootOrganizationId: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty({ type: Object, required: false })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  isActive: boolean;

  constructor(organization: any) {
    this.id = organization._id?.toString() || organization.id;
    this.name = organization.name;
    this.slug = organization.slug;
    this.ownerId = organization.ownerId;
    this.parentId = organization.parentId || null;
    this.rootOrganizationId = organization.rootOrganizationId;
    this.logo = organization.logo;
    this.address = organization.address;
    this.email = organization.email;
    this.phone = organization.phone;
    this.isActive = organization.isActive;
  }
}
