import { ForgetPasswordDto } from '../../dto/forget-password.dto';

export class ForgetPasswordCommand {
  constructor(public readonly forgetPasswordDto: ForgetPasswordDto) {}
}
