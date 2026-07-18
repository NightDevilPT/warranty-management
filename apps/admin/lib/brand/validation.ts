import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const updateBrandSchema = createBrandSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBrandFormData = z.infer<typeof createBrandSchema>;
export type UpdateBrandFormData = z.infer<typeof updateBrandSchema>;
