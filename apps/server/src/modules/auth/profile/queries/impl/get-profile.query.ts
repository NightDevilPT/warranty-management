export class GetProfileQuery {
  constructor(
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
