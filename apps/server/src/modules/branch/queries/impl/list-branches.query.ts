// src/modules/branch/queries/impl/list-branches.query.ts
export class ListBranchesQuery {
  constructor(
    public readonly parentOrgId: string, // Changed from parentSlug
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly isActive?: boolean,
  ) {}
}
