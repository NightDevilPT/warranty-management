import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  Brand,
  BrandDetail,
  CreateBrandInput,
  UpdateBrandInput,
} from "./types";

// List brands with optional orgId filter and pagination
export function getBrands(
  filters?: Record<string, string | number | boolean | undefined>,
): Promise<IApiResponse<Brand[]>> {
  return apiClient.get("/admin/brands", filters);
}

// Get single brand detail
export function getBrand(
  orgId: string,
  id: string,
): Promise<IApiResponse<BrandDetail>> {
  return apiClient.get(`/admin/brands/organizations/${orgId}/${id}`);
}

// Create brand
export function createBrand(
  orgId: string,
  data: CreateBrandInput,
): Promise<IApiResponse<Brand>> {
  return apiClient.post(`/admin/brands/organizations/${orgId}`, data);
}

// Update brand
export function updateBrand(
  orgId: string,
  id: string,
  data: UpdateBrandInput,
): Promise<IApiResponse<Brand>> {
  return apiClient.patch(`/admin/brands/organizations/${orgId}/${id}`, data);
}

// Delete brand
export function deleteBrand(
  orgId: string,
  id: string,
): Promise<IApiResponse<null>> {
  return apiClient.delete(`/admin/brands/organizations/${orgId}/${id}`);
}
