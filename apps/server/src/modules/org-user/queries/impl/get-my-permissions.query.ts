// src/modules/org-user/queries/impl/get-my-permissions.query.ts
export class GetMyPermissionsQuery {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
