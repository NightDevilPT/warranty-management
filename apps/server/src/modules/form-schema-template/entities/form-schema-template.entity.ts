// src/modules/form-schema-template/entities/form-schema-template.entity.ts
import {
  FieldType,
  FormField,
  FormSchemaCategory,
  FormTemplate,
} from 'interfaces/form-schema.interface';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FormSchemaTemplateDocument = FormSchemaTemplate & Document;

// Define the FieldOption class
class FieldOption {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  value: string;

  @Prop({ type: String })
  color?: string;

  @Prop({ type: String })
  icon?: string;
}

// Define the FieldValidation class
class FieldValidation {
  @Prop({ type: Boolean })
  required?: boolean;

  @Prop({ type: Number })
  minLength?: number;

  @Prop({ type: Number })
  maxLength?: number;

  @Prop({ type: Number })
  minValue?: number;

  @Prop({ type: Number })
  maxValue?: number;

  @Prop({ type: String })
  pattern?: string;

  @Prop({ type: String })
  customValidator?: string;

  @Prop({ type: [String] })
  fileTypes?: string[];

  @Prop({ type: Number })
  maxFileSize?: number;
}

// Define the FormField class
class FormFieldClass {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({
    type: String,
    enum: Object.values(FieldType),
    required: true,
  })
  type: FieldType;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  placeholder?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [FieldOption] })
  options?: FieldOption[];

  @Prop({ type: FieldValidation })
  validation?: FieldValidation;

  @Prop({ type: Object })
  defaultValue?: any;

  @Prop({ type: Object })
  value?: any;

  @Prop({ type: Boolean })
  isHidden?: boolean;

  @Prop({ type: Boolean })
  isDisabled?: boolean;

  @Prop({ type: [String] })
  dependsOn?: string[];

  @Prop({ type: Number, required: true })
  order: number;
}

@Schema({ timestamps: true, collection: 'form_schema_templates' })
export class FormSchemaTemplate implements FormTemplate {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ enum: FormSchemaCategory, required: true })
  category: FormSchemaCategory;

  @Prop({ type: [FormFieldClass], required: true })
  fields: FormField[];

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  rootOrganizationId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const FormSchemaTemplateSchema =
  SchemaFactory.createForClass(FormSchemaTemplate);

// Create indexes for better query performance
FormSchemaTemplateSchema.index({ rootOrganizationId: 1 });
FormSchemaTemplateSchema.index({ category: 1 });
FormSchemaTemplateSchema.index({ isActive: 1 });
FormSchemaTemplateSchema.index({ createdAt: -1 });
