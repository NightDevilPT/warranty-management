import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];

export const fileSchema = z.object({
  size: z
    .number()
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    ),
  type: z
    .string()
    .refine(
      (type) => ALLOWED_TYPES.includes(type),
      `File type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}, ${ALLOWED_DOC_TYPES.join(", ")}`,
    ),
});

export const imageSchema = z.object({
  size: z
    .number()
    .max(
      MAX_FILE_SIZE,
      `Image size must be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
    ),
  type: z
    .string()
    .refine(
      (type) => ALLOWED_IMAGE_TYPES.includes(type),
      `Image type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    ),
});

export function validateFile(file: File): { valid: boolean; error?: string } {
  const result = fileSchema.safeParse({
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const error = result.error.errors[0]?.message || "Invalid file";
    return { valid: false, error };
  }

  return { valid: true };
}

export function validateImage(file: File): { valid: boolean; error?: string } {
  const result = imageSchema.safeParse({
    size: file.size,
    type: file.type,
  });

  if (!result.success) {
    const error = result.error.errors[0]?.message || "Invalid image";
    return { valid: false, error };
  }

  return { valid: true };
}
