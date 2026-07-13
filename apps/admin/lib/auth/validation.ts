import { z } from "zod";

export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z
    .number()
    .min(100000, "OTP must be 6 digits")
    .max(999999, "OTP must be 6 digits"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  profile: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export type SendOtpFormData = z.infer<typeof sendOtpSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
