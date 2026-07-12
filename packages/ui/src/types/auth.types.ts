// ──── Request DTOs ────

export interface SendOtpDto {
  email: string;
  orgHash?: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: number;
  orgHash?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profile?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ──── Response DTOs ────

export interface SendOtpResponse {
  message: string;
  expiresIn: number;
  isNewUser?: boolean;
  otp?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    profile: string | null;
  };
  org: {
    id: string;
    name: string;
    hash: string;
  };
  portalType: string;
  permissions: string[];
}

export interface CurrentOrg {
  orgId: string;
  orgName: string;
  portalType: string;
  role: string;
  permissions: string[];
}

export interface ProfileResponse {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  profile?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  currentOrg: CurrentOrg;
}

// ──── Auth State ────

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  profile: string | null;
}

export interface AuthOrg {
  id: string;
  name: string;
  hash: string;
}

export interface AuthState {
  user: AuthUser | null;
  org: AuthOrg | null;
  permissions: string[];
  isAuthenticated: boolean;
  loading: boolean;
}
