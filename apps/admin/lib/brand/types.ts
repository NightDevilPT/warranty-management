export interface Brand {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDetail extends Brand {
  productCount: number;
}

export interface CreateBrandInput {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

export interface UpdateBrandInput {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
}
