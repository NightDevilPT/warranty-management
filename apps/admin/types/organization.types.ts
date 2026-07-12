// types/organization.types.ts

export type OrganizationType = "ROOT" | "BRANCH";
export type OrganizationStatusFilter = "active" | "disabled" | "deleted";
export type OrganizationStatusAction =
  | "activate"
  | "deactivate"
  | "soft-delete";

export interface Organization {
  id: string;
  name: string;
  companyName: string;
  slug: string;
  hash: string;
  type: OrganizationType | string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgHierarchyNode {
  id: string;
  name: string;
}

export interface OrgHierarchy {
  root: OrgHierarchyNode | null;
  parent: OrgHierarchyNode | null;
  children: { id: string; name: string; type: string }[];
}

export interface OrgStats {
  totalUsers: number;
  totalBrands: number;
  totalCategories: number;
  totalDealerTypes: number;
}

export interface OrganizationDetail extends Organization {
  hierarchy: OrgHierarchy;
  stats: OrgStats;
}

export interface CreateOrganizationInput {
  name: string;
  companyName: string;
  slug: string;
  type?: OrganizationType;
  logo?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  companyName?: string;
  slug?: string;
  logo?: string;
}

export interface UpdateOrganizationStatusInput {
  action: OrganizationStatusAction;
}

export interface StatusResponse {
  id: string;
  status: string;
  isActive: boolean;
  message: string;
}

export interface InviteSuperAdminInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface InviteSuperAdminResponse {
  userId: string;
  userAccessId: string;
  email: string;
  fullName: string;
  role: string;
  invitationSent: boolean;
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrganizationType;
  status?: OrganizationStatusFilter;
}
