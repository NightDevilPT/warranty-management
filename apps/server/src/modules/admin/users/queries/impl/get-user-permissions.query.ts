export class GetUserPermissionsQuery {
  constructor(
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
