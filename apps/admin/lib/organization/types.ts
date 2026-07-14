// ============ Organization Entity ============
export interface Organization {
  id: string;
  name: string;
  companyName: string;
  slug: string;
  hash: string;
  type: OrganizationType;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationType = "ROOT" | "BRANCH";

// ============ Organization Detail (with hierarchy & stats) ============
export interface OrganizationDetail extends Organization {
  hierarchy: OrganizationHierarchy;
  stats: OrganizationStats;
}

export interface OrganizationHierarchy {
  root: { id: string; name: string } | null;
  parent: { id: string; name: string } | null;
  children: { id: string; name: string; type: string }[];
}

export interface OrganizationStats {
  totalUsers: number;
  totalBrands: number;
  totalCategories: number;
  totalDealerTypes: number;
}

// ============ Create Input ============
export interface CreateOrganizationInput {
  name: string;
  companyName: string;
  slug: string;
  type?: OrganizationType;
  logo?: string;
}

// ============ Update Input ============
export interface UpdateOrganizationInput {
  name?: string;
  companyName?: string;
  slug?: string;
  logo?: string;
}

// ============ Status Update Input ============
export interface UpdateOrganizationStatusInput {
  action: "activate" | "deactivate" | "soft-delete";
}

// ============ Invite Super Admin Input ============
export interface InviteSuperAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// ============ Status Response ============
export interface StatusResponse {
  id: string;
  status: string;
  isActive: boolean;
  message: string;
}

// ============ Invite Response ============
export interface InviteSuperAdminResponse {
  userId: string;
  userAccessId: string;
  email: string;
  fullName: string;
  role: string;
  invitationSent: boolean;
}

// ============ Options (for dropdowns) ============
export interface OrganizationOption {
  id: string;
  label: string;
  slug: string;
}

// ============ List Filters ============
export interface OrganizationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrganizationType;
  status?: "active" | "disabled" | "deleted";
}
