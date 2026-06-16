import { CommonModules } from 'services';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { FeatureModule } from './feature/feature.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';

export const AllModules = [
  ...CommonModules,
  AuthModule,
  UserModule,
  OrganizationModule,
  FeatureModule,
  CategoryModule,
  BrandModule,
];
