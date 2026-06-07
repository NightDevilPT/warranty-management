import { CommonModules } from 'services';
import { UsersModule } from './users/users.module';

export const AllModules = [UsersModule, ...CommonModules];
