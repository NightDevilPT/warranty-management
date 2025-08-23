// src/modules/form-schema-template/repository/form-schema-template.repository.ts
import {
  FormSchemaTemplate,
  FormSchemaTemplateDocument,
} from '../entities/form-schema-template.entity';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'common/repository/base.repository';
import { FormSchemaCategory } from 'interfaces/form-schema.interface';

@Injectable()
export class FormSchemaTemplateRepository extends BaseRepository<FormSchemaTemplateDocument> {
  constructor(
    @InjectModel(FormSchemaTemplate.name)
    private readonly formSchemaTemplateModel: Model<FormSchemaTemplateDocument>,
  ) {
    super(formSchemaTemplateModel);
  }

  public async findByOrganizationId(
    organizationId: Types.ObjectId,
  ): Promise<FormSchemaTemplateDocument[]> {
    return this.formSchemaTemplateModel.find({
      rootOrganizationId: organizationId,
    });
  }

  public async findFormSchemaByCategory(
    category: FormSchemaCategory,
    orgId: Types.ObjectId,
  ): Promise<FormSchemaTemplateDocument | null> {
    return this.formSchemaTemplateModel.findOne({
      category: category,
      rootOrganizationId: orgId,
    });
  }
}
