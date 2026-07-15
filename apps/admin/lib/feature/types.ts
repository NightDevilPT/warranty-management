export type FeatureStatus = "ENABLED" | "DISABLED" | "COMING_SOON";

export interface FeatureChild {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  status: string;
}

export interface Feature {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  status: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureTreeItem extends Feature {
  children: FeatureChild[];
}

export interface FeatureDetail extends Feature {
  parent: { id: string; name: string; code: string } | null;
  children: FeatureChild[];
  assignedDealerTypesCount: number;
}

export interface CreateFeatureInput {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateFeatureInput {
  name?: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  sortOrder?: number;
}

export interface UpdateFeatureStatusInput {
  status: FeatureStatus;
}
