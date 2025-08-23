// src/modules/form-schema-template/dto/response-form-schema-template.dto.ts
import {
  FormSchemaCategory,
  FormTemplate,
} from 'interfaces/form-schema.interface';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class FormSchemaTemplateResponseDto implements FormTemplate {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false, default: '' })
  description?: string;

  @ApiProperty()
  category: FormSchemaCategory;

  @ApiProperty({ default: [] })
  fields: any[];

  @ApiProperty()
  rootOrganizationId: Types.ObjectId;

  @ApiProperty({ default: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(formSchema: any) {
    this.id = formSchema._id?.toString() || formSchema.id;
    this.title = formSchema.title;
    this.description = formSchema.description || '';
    this.category = formSchema.category;
    this.fields = formSchema.fields || [];
    this.rootOrganizationId =
      formSchema.rootOrganizationId?.toString() ||
      formSchema.rootOrganizationId;
    this.isActive =
      formSchema.isActive !== undefined ? formSchema.isActive : true;
    this.createdAt = formSchema.createdAt;
    this.updatedAt = formSchema.updatedAt;
  }
}
