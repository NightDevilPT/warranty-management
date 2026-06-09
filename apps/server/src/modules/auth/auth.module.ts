import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCommandHandlers } from './commands';
import { JwtAuthGuard } from 'middleware/guards/jwt-auth.guard';
import { AuthQueryHandlers } from './queries';

@Module({
  imports: [...CommonModules],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    ...AuthCommandHandlers,
    ...AuthQueryHandlers,
  ],
})
export class AuthModule {}
