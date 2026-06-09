import { CommonModules } from 'services';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';

export const AllModules = [...CommonModules, AuthModule, UserModule];
