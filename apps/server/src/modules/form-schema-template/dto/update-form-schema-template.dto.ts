import { PartialType } from '@nestjs/mapped-types';
import { CreateFormSchemaTemplateDto } from './create-form-schema-template.dto';

export class UpdateFormSchemaTemplateDto extends PartialType(CreateFormSchemaTemplateDto) {}
