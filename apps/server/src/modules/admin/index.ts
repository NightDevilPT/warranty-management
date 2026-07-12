import { BrandsModule } from './brands/brands.module';
import { FeaturesModule } from './features/features.module';
import { OrganizationsModule } from './organizations/organizations.module';

export const AllAdminModule = [
  OrganizationsModule,
  FeaturesModule,
  BrandsModule,
];
