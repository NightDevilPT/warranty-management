export class DeleteCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
