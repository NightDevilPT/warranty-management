// src/users/user.module.ts
import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { PrismaModule } from 'services/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CommonModules } from 'services';
import { UserCommandHandlers } from './commands';

@Module({
  imports: [PrismaModule, ...CommonModules],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, ...UserCommandHandlers],
  exports: [UsersService, UserRepository],
})
export class UserModule {}
