// src/modules/auth/commands/index.ts
import { LoginHandler } from './handlers/login.handler';
import { SendOtpHandler } from './handlers/send-otp.handler';
import { VerifyOtpHandler } from './handlers/verify-otp.handler';
import { RefreshTokenHandler } from './handlers/refresh-token.handler';
import { LogoutHandler } from './handlers/logout.handler';

export const AuthCommandHandlers = [
  LoginHandler,
  SendOtpHandler,
  VerifyOtpHandler,
  RefreshTokenHandler,
  LogoutHandler,
];
