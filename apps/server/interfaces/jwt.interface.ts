import { ROLES } from "src/modules/users/interface/user.interface";

// src/common/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  roles: {
    role: ROLES;
    organizationId: string | 'global';
    rootOrganizationId: string | 'global';
  }[];
  // Add any other user properties you need
}

// Extend Express Request type
declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}

export enum TokenExpiration {
  ACCESS_TOKEN = '10m',
  REFRESH_TOKEN = '12m',
  EMAIL_VERIFICATION = '15m',
  PASSWORD_RESET = '30m',
  // Add more if needed
}
