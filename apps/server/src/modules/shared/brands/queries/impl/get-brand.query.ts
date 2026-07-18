export class GetBrandQuery {
  constructor(
    public readonly brandId: string,
    public readonly orgId: string,
  ) {}
}
