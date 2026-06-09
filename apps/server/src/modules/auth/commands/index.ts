import { LoginHandler } from './handlers/login.handler';
import { SendOtpHandler } from './handlers/send-otp.handler';
import { VerifyOtpHandler } from './handlers/verify-otp.handler';

export const AuthCommandHandlers = [
  SendOtpHandler,
  LoginHandler,
  VerifyOtpHandler,
];
