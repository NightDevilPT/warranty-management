import { SendOtpDto } from '../../dto/send-otp.dto';

export class SendOtpCommand {
  constructor(public readonly dto: SendOtpDto) {}
}
