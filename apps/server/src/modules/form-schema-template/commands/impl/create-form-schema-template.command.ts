// src/modules/form-schema-template/commands/impl/create-form-schema-template.command.ts
import { CreateFormSchemaTemplateDto } from '../../dto/create-form-schema-template.dto';

export class CreateFormSchemaTemplateCommand {
  constructor(
    public readonly userId: string,
    public readonly createFormSchemaTemplateDto: CreateFormSchemaTemplateDto,
  ) {}
}
