export class GetUserQuery {
  constructor(
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
