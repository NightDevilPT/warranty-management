import { Test, TestingModule } from '@nestjs/testing';
import { FormSchemaTemplateController } from './form-schema-template.controller';
import { FormSchemaTemplateService } from './form-schema-template.service';

describe('FormSchemaTemplateController', () => {
  let controller: FormSchemaTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormSchemaTemplateController],
      providers: [FormSchemaTemplateService],
    }).compile();

    controller = module.get<FormSchemaTemplateController>(FormSchemaTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
