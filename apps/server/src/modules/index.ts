import { CommonModules } from 'services';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

export const AllModules = [UsersModule, AuthModule, ...CommonModules];
