import { SendOtpHandler } from './handlers/send-otp.handler';
import { VerifyOtpHandler } from './handlers/verify-otp.handler';

export const OtpCommandHandlers = [SendOtpHandler, VerifyOtpHandler];
