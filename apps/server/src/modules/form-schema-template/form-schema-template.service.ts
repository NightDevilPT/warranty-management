// src/modules/form-schema-template/form-schema-template.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateFormSchemaTemplateDto } from './dto/create-form-schema-template.dto';
import { FormSchemaTemplateResponseDto } from './dto/response-form-schema-template.dto';
import { CreateFormSchemaTemplateCommand } from './commands/impl/create-form-schema-template.command';

@Injectable()
export class FormSchemaTemplateService {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async createFormSchemaTemplate(
    createFormSchemaTemplateDto: CreateFormSchemaTemplateDto,
    userId: string,
  ): Promise<FormSchemaTemplateResponseDto> {
    return this.commandBus.execute(
      new CreateFormSchemaTemplateCommand(userId, createFormSchemaTemplateDto),
    );
  }
}