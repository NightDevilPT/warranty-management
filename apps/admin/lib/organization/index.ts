import { apiClient } from "@workspace/ui/lib/api-client";
import type { IApiResponse } from "@workspace/ui/types/api.types";
import type {
  Organization,
  OrganizationDetail,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateOrganizationStatusInput,
  InviteSuperAdminInput,
  StatusResponse,
  InviteSuperAdminResponse,
  OrganizationOption,
} from "./types";

// ============ List Organizations (with pagination & filters) ============
// Fixed: Convert OrganizationFilters to Record<string, string | number | boolean | undefined>
export function getOrganizations(
  filters?: Record<string, string | number | boolean | undefined>,
): Promise<IApiResponse<Organization[]>> {
  return apiClient.get("/admin/organizations", filters);
}

// ============ Get Organization Options (for dropdowns) ============
export function getOrganizationOptions(
  search?: string,
): Promise<IApiResponse<OrganizationOption[]>> {
  return apiClient.get(
    "/admin/organizations/options",
    search ? { search } : undefined,
  );
}

// ============ Get Single Organization Detail ============
export function getOrganization(
  orgId: string,
): Promise<IApiResponse<OrganizationDetail>> {
  return apiClient.get(`/admin/organizations/${orgId}`);
}

// ============ Create Organization ============
export function createOrganization(
  data: CreateOrganizationInput,
): Promise<IApiResponse<Organization>> {
  return apiClient.post("/admin/organizations", data);
}

// ============ Update Organization ============
export function updateOrganization(
  orgId: string,
  data: UpdateOrganizationInput,
): Promise<IApiResponse<Organization>> {
  return apiClient.patch(`/admin/organizations/${orgId}`, data);
}

// ============ Update Organization Status ============
export function updateOrganizationStatus(
  orgId: string,
  data: UpdateOrganizationStatusInput,
): Promise<IApiResponse<StatusResponse>> {
  return apiClient.patch(`/admin/organizations/${orgId}/status`, data);
}

// ============ Invite Super Admin ============
export function inviteSuperAdmin(
  orgId: string,
  data: InviteSuperAdminInput,
): Promise<IApiResponse<InviteSuperAdminResponse>> {
  return apiClient.post(
    `/admin/organizations/${orgId}/invite-super-admin`,
    data,
  );
}

// ============ Upload Organization Logo ============
// Fixed: Removed the 3rd argument (config), as apiClient.post only accepts 2 args
// The apiClient should handle multipart internally or through its default config
export function uploadOrganizationLogo(
  orgId: string,
  file: File,
): Promise<IApiResponse<Organization>> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(`/admin/organizations/${orgId}/logo`, formData);
}
