export class ListCategoriesQuery {
  constructor(
    public readonly orgId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly status?: string,
    public readonly parentId?: string,
  ) {}
}
