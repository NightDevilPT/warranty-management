// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCommandHandlers } from './commands';

@Module({
  imports: [...CommonModules],
  controllers: [AuthController],
  providers: [AuthService, ...AuthCommandHandlers],
})
export class AuthModule {}
