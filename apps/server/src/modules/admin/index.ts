import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { DealerTypesModule } from './dealer-types/dealer-types.module';
import { FeaturesModule } from './features/features.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';

export const AllAdminModule = [
  OrganizationsModule,
  FeaturesModule,
  BrandsModule,
  CategoriesModule,
  DealerTypesModule,
  UsersModule,
];
