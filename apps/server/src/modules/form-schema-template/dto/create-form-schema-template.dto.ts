// src/modules/form-schema-template/dto/create-form-schema-template.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FieldType,
  FormSchemaCategory,
  FormTemplate,
} from 'interfaces/form-schema.interface';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

class FieldOptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  icon?: string;
}

class FieldValidationDto {
  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  minLength?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxLength?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  minValue?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxValue?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pattern?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customValidator?: string;

  @ApiProperty({ required: false, default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileTypes?: string[] = [];

  @ApiProperty({ required: false })
  @IsOptional()
  maxFileSize?: number;
}

class FormFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ enum: FieldType })
  @IsString()
  @IsNotEmpty()
  type: FieldType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  placeholder?: string = '';

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  description?: string = '';

  @ApiProperty({ type: [FieldOptionDto], required: false, default: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  @IsOptional()
  options?: FieldOptionDto[] = [];

  @ApiProperty({ required: false })
  @ValidateNested()
  @Type(() => FieldValidationDto)
  @IsOptional()
  validation?: FieldValidationDto = {};

  @ApiProperty({ required: false })
  @IsOptional()
  defaultValue?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  value?: any;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean = false;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean = false;

  @ApiProperty({ type: [String], required: false, default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependsOn?: string[] = [];

  @ApiProperty({ default: 0 })
  @IsNotEmpty()
  order: number = 0;
}

export class CreateFormSchemaTemplateDto
  implements Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt'>
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, default: '' })
  @IsString()
  @IsOptional()
  description: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: FormSchemaCategory;

  @ApiProperty({ type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  @IsNotEmpty()
  fields: FormFieldDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  rootOrganizationId: Types.ObjectId;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean = true;
}
