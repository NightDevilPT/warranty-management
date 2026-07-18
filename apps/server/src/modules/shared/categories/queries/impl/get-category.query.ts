export class GetCategoryQuery {
  constructor(
    public readonly categoryId: string,
    public readonly orgId: string,
  ) {}
}
