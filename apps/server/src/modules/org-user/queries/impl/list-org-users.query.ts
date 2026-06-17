// src/modules/org-user/queries/impl/list-org-users.query.ts
export class ListOrgUsersQuery {
  constructor(
    public readonly orgId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly role?: string,
    public readonly portalType?: string,
  ) {}
}
