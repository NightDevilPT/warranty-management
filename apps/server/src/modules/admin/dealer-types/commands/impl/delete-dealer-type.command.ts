export class DeleteDealerTypeCommand {
  constructor(
    public readonly dealerTypeId: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
