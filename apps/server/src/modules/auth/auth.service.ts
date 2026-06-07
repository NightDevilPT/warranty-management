// src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginCommand } from './commands/impl/login.command';
import { SendOtpCommand } from './commands/impl/send-otp.command';
import { VerifyOtpCommand } from './commands/impl/verify-otp.command';
import { RefreshTokenCommand } from './commands/impl/refresh-token.command';
import { LogoutCommand } from './commands/impl/logout.command';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  async sendOtp(dto: SendOtpDto) {
    return this.commandBus.execute(new SendOtpCommand(dto));
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new VerifyOtpCommand(dto));
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    return this.commandBus.execute(new RefreshTokenCommand(refreshToken));
  }

  async logout(userId: string, res?: any) {
    return this.commandBus.execute(new LogoutCommand(userId, res));
  }
}
