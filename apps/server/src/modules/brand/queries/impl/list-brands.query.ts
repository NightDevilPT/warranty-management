// src/modules/brand/queries/impl/list-brands.query.ts
export class ListBrandsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly orgId?: string,
    public readonly isActive?: boolean,
  ) {}
}
