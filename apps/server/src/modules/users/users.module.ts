// src/users/user.module.ts
import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { PrismaModule } from 'services/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CommonModules } from 'common';

@Module({
  imports: [PrismaModule, ...CommonModules],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UserModule {}
