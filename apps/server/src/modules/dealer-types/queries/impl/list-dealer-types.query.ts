export class ListDealerTypesQuery {
  constructor(
    public readonly orgId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly partnerType?: string,
    public readonly isActive?: boolean,
  ) {}
}
