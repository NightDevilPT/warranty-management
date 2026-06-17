// src/modules/org-user/queries/impl/get-user-features.query.ts
export class GetUserFeaturesQuery {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
