export class GetDealerTypeQuery {
  constructor(
    public readonly dealerTypeId: string,
    public readonly orgId: string,
  ) {}
}
