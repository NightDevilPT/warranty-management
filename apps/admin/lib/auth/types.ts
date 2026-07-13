import type { IApiResponse } from "@workspace/ui/types/api.types";

// ──── Request Inputs ────

export interface SendOtpInput {
  email: string;
  orgHash?: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: number;
  orgHash?: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profile?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ──── Response Types ────

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

export interface ChangePasswordResponse {
  message: string;
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

// ──── API Response Wrappers ────

export type SendOtpApiResponse = IApiResponse<SendOtpResponse>;
export type VerifyOtpApiResponse = IApiResponse<VerifyOtpResponse>;
export type ProfileApiResponse = IApiResponse<ProfileResponse>;
export type ChangePasswordApiResponse = IApiResponse<ChangePasswordResponse>;
export type LogoutApiResponse = IApiResponse<{ message: string }>;
