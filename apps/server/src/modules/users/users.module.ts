import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CommonModules } from 'services';
import { UserCommandHandlers } from './commands';

@Module({
  imports: [...CommonModules],
  controllers: [UsersController],
  providers: [UsersService, ...UserCommandHandlers],
})
export class UsersModule {}
