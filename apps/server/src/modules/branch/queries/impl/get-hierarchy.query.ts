// src/modules/branch/queries/impl/get-hierarchy.query.ts
export class GetHierarchyQuery {
  constructor(
    public readonly orgId: string, // Changed from slug
    public readonly depth?: number,
  ) {}
}
