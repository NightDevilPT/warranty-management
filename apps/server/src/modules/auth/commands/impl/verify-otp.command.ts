import { VerifyOtpDto } from '../../dto/verify-otp.dto';

export class VerifyOtpCommand {
  constructor(public readonly dto: VerifyOtpDto) {}
}
