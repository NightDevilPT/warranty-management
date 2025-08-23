import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { OrganizationModule } from './organization/organization.module';
import { FormSchemaTemplateModule } from './form-schema-template/form-schema-template.module';

export const AllModules = [
  UsersModule,
  SettingsModule,
  OrganizationModule,
  FormSchemaTemplateModule,
];
