import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  Feature,
  FeatureDetail,
  FeatureTreeItem,
  CreateFeatureInput,
  UpdateFeatureInput,
  UpdateFeatureStatusInput,
} from "./types";

// GET /admin/features - List (returns { items: Feature[], meta: {...} })
export function getFeatures(
  filters?: Record<string, string | number | boolean | undefined>,
): Promise<IApiResponse<Feature[]>> {
  return apiClient.get("/admin/features", filters);
}

// GET /admin/features/tree - Tree (returns direct array FeatureTreeItem[])
export function getFeatureTree(): Promise<IApiResponse<FeatureTreeItem[]>> {
  return apiClient.get("/admin/features/tree");
}

// GET /admin/features/:featureId - Detail
export function getFeature(
  featureId: string,
): Promise<IApiResponse<FeatureDetail>> {
  return apiClient.get(`/admin/features/${featureId}`);
}

// POST /admin/features - Create
export function createFeature(
  data: CreateFeatureInput,
): Promise<IApiResponse<Feature>> {
  return apiClient.post("/admin/features", data);
}

// PATCH /admin/features/:featureId - Update
export function updateFeature(
  featureId: string,
  data: UpdateFeatureInput,
): Promise<IApiResponse<Feature>> {
  return apiClient.patch(`/admin/features/${featureId}`, data);
}

// PATCH /admin/features/:featureId/status - Update Status
export function updateFeatureStatus(
  featureId: string,
  data: UpdateFeatureStatusInput,
): Promise<IApiResponse<Feature>> {
  return apiClient.patch(`/admin/features/${featureId}/status`, data);
}
