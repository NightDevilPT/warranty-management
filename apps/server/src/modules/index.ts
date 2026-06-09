import { CommonModules } from 'services';
import { AuthModule } from './auth/auth.module';

export const AllModules = [...CommonModules, AuthModule];
