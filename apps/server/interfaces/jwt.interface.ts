// src/interfaces/custom-request.interface.ts
import { Request } from 'express';

// src/interfaces/jwt.interface.ts
export interface UserPayload {
  userId: string;
  [key: string]: any;
}

export interface GuardRequest extends Request {
  user?: UserPayload;
}

export enum TokenExpiration {
  ACCESS_TOKEN = '10m',
  REFRESH_TOKEN = '12m',
  EMAIL_VERIFICATION = '15m',
  PASSWORD_RESET = '30m',
  // Add more if needed
}
