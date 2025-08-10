// src/modules/organization/repository/organization.repository.ts
import {
  Organization,
  OrganizationDocument,
} from '../entities/organization.entity';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'common/repository/base.repository';

@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel);
  }
}
