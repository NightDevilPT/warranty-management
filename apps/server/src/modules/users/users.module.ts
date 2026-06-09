import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { UserCommandHandlers } from './commands';
import { UserQueryHandlers } from './queries';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { RolesGuard } from 'middleware/guards/roles.guard';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [...CommonModules],
  controllers: [UserController],
  providers: [
    UserService,
    JwtAuthGuard,
    RolesGuard,
    ...UserCommandHandlers,
    ...UserQueryHandlers,
  ],
})
export class UserModule {}
