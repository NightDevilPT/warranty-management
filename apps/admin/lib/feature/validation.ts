import { z } from "zod";

export const createFeatureSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50)
    .regex(/^[A-Z][A-Z0-9_]*$/, "Code must be UPPERCASE with underscores"),
  description: z.string().max(500).optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
  sortOrder: z.number().min(0).optional(),
});

export const updateFeatureSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().min(0).optional(),
});

export const updateFeatureStatusSchema = z.object({
  status: z.enum(["ENABLED", "DISABLED", "COMING_SOON"]),
});

export type CreateFeatureFormData = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureFormData = z.infer<typeof updateFeatureSchema>;
