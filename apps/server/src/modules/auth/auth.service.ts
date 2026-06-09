import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpCommand } from './commands/impl/send-otp.command';
import { VerifyOtpCommand } from './commands/impl/verify-otp.command';
import { LoginCommand } from './commands/impl/login.command';
import { GetMeQuery } from './queries/impl/get-me.query';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    return this.commandBus.execute(new SendOtpCommand(dto));
  }

  async verifyOtp(dto: VerifyOtpDto) {
    return this.commandBus.execute(new VerifyOtpCommand(dto));
  }

  async login(dto: LoginDto) {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  async getMe(userId: string) {
    return this.queryBus.execute(new GetMeQuery(userId));
  }
}
