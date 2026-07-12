export class GetPermissionsQuery {
  constructor(
    public readonly dealerTypeId: string,
    public readonly orgId: string,
  ) {}
}
