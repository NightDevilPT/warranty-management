// src/modules/auth/commands/impl/send-otp.command.ts
import { SendOtpDto } from '../../dto/send-otp.dto';

export class SendOtpCommand {
  constructor(public readonly dto: SendOtpDto) {}
}
