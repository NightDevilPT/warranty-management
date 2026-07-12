import { CommonModules } from 'services';
import { OtpModule } from './auth/otp/otp.module';
import { ProfileModule } from './auth/profile/profile.module';
import { AllAuthModules } from './auth';
import { AllAdminModule } from './admin';

export const AllModules = [
  ...CommonModules,
  ...AllAuthModules,
  ...AllAdminModule,
];
