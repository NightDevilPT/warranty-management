import { Module } from '@nestjs/common';
import { CommonModules } from 'services';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpCommandHandlers } from './commands';

@Module({
  imports: [...CommonModules],
  controllers: [OtpController],
  providers: [OtpService, ...OtpCommandHandlers],
  exports: [OtpService],
})
export class OtpModule {}
