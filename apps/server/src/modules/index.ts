import { CommonModules } from 'services';
import { OtpModule } from './auth/otp/otp.module';
import { ProfileModule } from './auth/profile/profile.module';

export const AllModules = [...CommonModules, OtpModule, ProfileModule];
