import { apiClient } from "@workspace/ui/lib/api-client";
import type {
  SendOtpInput,
  VerifyOtpInput,
  UpdateProfileInput,
  ChangePasswordInput,
  SendOtpApiResponse,
  VerifyOtpApiResponse,
  ProfileApiResponse,
  ChangePasswordApiResponse,
  LogoutApiResponse,
} from "./types";

const PORTAL_TYPE = "admin";

export function sendOtp(input: SendOtpInput): Promise<SendOtpApiResponse> {
  return apiClient.post(`/auth/${PORTAL_TYPE}/send-otp`, input);
}

export function verifyOtp(
  input: VerifyOtpInput,
): Promise<VerifyOtpApiResponse> {
  return apiClient.post(`/auth/${PORTAL_TYPE}/verify-otp`, input);
}

export function logout(): Promise<LogoutApiResponse> {
  return apiClient.post("/auth/logout");
}

export function fetchProfile(): Promise<ProfileApiResponse> {
  return apiClient.get("/auth/me");
}

export function updateProfile(
  input: UpdateProfileInput,
): Promise<ProfileApiResponse> {
  return apiClient.patch("/auth/me", input);
}

export function changePassword(
  input: ChangePasswordInput,
): Promise<ChangePasswordApiResponse> {
  return apiClient.patch("/auth/me/password", input);
}

export function uploadProfilePicture(file: File): Promise<ProfileApiResponse> {
  return apiClient.upload("/auth/me/profile-picture", file);
}
