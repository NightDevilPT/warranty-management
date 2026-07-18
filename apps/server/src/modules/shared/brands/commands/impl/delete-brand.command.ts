export class DeleteBrandCommand {
  constructor(
    public readonly brandId: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
