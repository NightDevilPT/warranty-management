import { CommonModules } from 'services';
import { AllAuthModules } from './auth';
import { AllAdminModule } from './admin';

export const AllModules = [
  ...CommonModules,
  ...AllAuthModules,
  ...AllAdminModule,
];
