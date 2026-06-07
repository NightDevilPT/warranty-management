import { CommonModules } from 'services';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationModule } from './organizations/organizations.module';

export const AllModules = [
  UsersModule,
  AuthModule,
  OrganizationModule,
  ...CommonModules,
];
