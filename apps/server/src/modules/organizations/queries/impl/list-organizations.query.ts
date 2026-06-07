// src/modules/organization/queries/impl/list-organizations.query.ts
export class ListOrganizationsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
  ) {}
}
