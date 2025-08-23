import { Test, TestingModule } from '@nestjs/testing';
import { FormSchemaTemplateService } from './form-schema-template.service';

describe('FormSchemaTemplateService', () => {
  let service: FormSchemaTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormSchemaTemplateService],
    }).compile();

    service = module.get<FormSchemaTemplateService>(FormSchemaTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
