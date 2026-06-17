// src/modules/org-user/queries/impl/get-org-user.query.ts
export class GetOrgUserQuery {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
