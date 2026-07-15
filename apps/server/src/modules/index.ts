import { CommonModules } from 'services';
import { AllAuthModules } from './auth';
import { AllAdminModule } from './admin';
import { FileModule } from 'services/files/file.module';
import { UploadModule } from './files/upload/upload.module';

export const AllModules = [
  ...CommonModules,
  ...AllAuthModules,
  ...AllAdminModule,
  UploadModule,
];
