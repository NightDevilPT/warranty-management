import { CommonModules } from 'services';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { FeatureModule } from './feature/feature.module';

export const AllModules = [
  ...CommonModules,
  AuthModule,
  UserModule,
  OrganizationModule,
  FeatureModule,
];
