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
