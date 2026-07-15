import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  SingleFileUploadResponse,
  MultipleFilesUploadResponse,
  UploadOptions,
} from "./types";
import { validateFile, validateImage } from "./validation";

/**
 * Upload a single file
 */
export async function uploadFile(
  file: File,
  options?: UploadOptions,
): Promise<IApiResponse<SingleFileUploadResponse>> {
  const formData = new FormData();
  formData.append("file", file);

  const queryParams: Record<string, string> = {};
  if (options?.folder) {
    queryParams.folder = options.folder;
  }

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = queryString
    ? `/files/upload/single?${queryString}`
    : "/files/upload/single";

  return apiClient.post(url, formData);
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options?: UploadOptions,
): Promise<IApiResponse<MultipleFilesUploadResponse>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const queryParams: Record<string, string> = {};
  if (options?.folder) {
    queryParams.folder = options.folder;
  }

  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const url = queryString
    ? `/files/upload/multiple?${queryString}`
    : "/files/upload/multiple";

  return apiClient.post(url, formData);
}

/**
 * Upload a single file with validation
 * Returns the public URL on success
 */
export async function uploadFileWithValidation(
  file: File,
  options?: UploadOptions,
): Promise<string | null> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const response = await uploadFile(file, options);
  if (response.success && response.data) {
    return response.data.file.publicUrl;
  }

  throw new Error(response.message || "Failed to upload file");
}

/**
 * Upload an image with image-specific validation
 * Returns the public URL on success
 */
export async function uploadImage(
  file: File,
  options?: UploadOptions,
): Promise<string | null> {
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const response = await uploadFile(file, options);
  if (response.success && response.data) {
    return response.data.file.publicUrl;
  }

  throw new Error(response.message || "Failed to upload image");
}

/**
 * Upload multiple files with validation
 * Returns array of public URLs on success
 */
export async function uploadFilesWithValidation(
  files: File[],
  options?: UploadOptions,
): Promise<string[]> {
  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(`${file.name}: ${validation.error}`);
    }
  }

  const response = await uploadFiles(files, options);
  if (response.success && response.data) {
    return response.data.files.map((f) => f.publicUrl);
  }

  throw new Error(response.message || "Failed to upload files");
}
