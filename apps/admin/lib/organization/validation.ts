import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must not exceed 200 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  type: z.enum(["ROOT", "BRANCH"]).optional().default("ROOT"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const updateOrganizationStatusSchema = z.object({
  action: z.enum(["activate", "deactivate", "soft-delete"], {
    errorMap: () => ({
      message: "Action must be activate, deactivate, or soft-delete",
    }),
  }),
});

export const inviteSuperAdminSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

export type CreateOrganizationFormData = z.infer<
  typeof createOrganizationSchema
>;
export type UpdateOrganizationFormData = z.infer<
  typeof updateOrganizationSchema
>;
export type UpdateOrganizationStatusFormData = z.infer<
  typeof updateOrganizationStatusSchema
>;
export type InviteSuperAdminFormData = z.infer<typeof inviteSuperAdminSchema>;
