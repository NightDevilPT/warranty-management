import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import {
  SendOtpResponseDto,
  VerifyOtpResponseDto,
} from './dto/otp-response.dto';
import { SendOtpCommand } from './commands/impl/send-otp.command';
import { VerifyOtpCommand } from './commands/impl/verify-otp.command';

@Injectable()
export class OtpService {
  constructor(private readonly commandBus: CommandBus) {}

  async sendOtp(
    dto: SendOtpDto,
    portalType: string,
  ): Promise<SendOtpResponseDto> {
    return this.commandBus.execute(new SendOtpCommand(dto, portalType));
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    portalType: string,
  ): Promise<VerifyOtpResponseDto> {
    return this.commandBus.execute(new VerifyOtpCommand(dto, portalType));
  }
}
