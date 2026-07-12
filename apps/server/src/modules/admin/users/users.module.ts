import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserCommandHandlers } from './commands';
import { UserQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [UsersController],
  providers: [UsersService, ...UserCommandHandlers, ...UserQueryHandlers],
})
export class UsersModule {}
