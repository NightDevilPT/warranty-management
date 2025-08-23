// src/modules/form-schema-template/form-schema-template.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSchemaTemplateService } from './form-schema-template.service';
import { FormSchemaTemplateController } from './form-schema-template.controller';
import {
  FormSchemaTemplate,
  FormSchemaTemplateSchema,
} from './entities/form-schema-template.entity';
import { FormSchemaTemplateRepository } from './repository/form-schema-template.repository';
import { LoggerService } from 'services/logger-service/index.service';
import { HttpErrorService } from 'services/http-error-service/index.service';
import { FormSchemaTemplateCommandHandlers } from './commands';
import { User, UserSchema } from '../users/entities/user.entity';
import { JwtTokenService } from 'services/jwt-token-service/index.service';
import { JwtModule } from '@nestjs/jwt';
import { OrganizationRepository } from '../organization/repository/organization.repository';
import { UserRepository } from '../users/repository/user.repository';
import { Organization, OrganizationSchema } from '../organization/entities/organization.entity';

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    MongooseModule.forFeature([
      { name: FormSchemaTemplate.name, schema: FormSchemaTemplateSchema },
      { name: User.name, schema: UserSchema }, // Assuming User schema is defined in users module
      { name: Organization.name, schema: OrganizationSchema }, // Assuming Organization schema is defined in users module
    ]),
  ],
  controllers: [FormSchemaTemplateController],
  providers: [
    FormSchemaTemplateService,
    FormSchemaTemplateRepository,
    OrganizationRepository,
    UserRepository,
    LoggerService,
    JwtTokenService,
    HttpErrorService,
    ...FormSchemaTemplateCommandHandlers,
  ],
  exports: [FormSchemaTemplateRepository],
})
export class FormSchemaTemplateModule {}
