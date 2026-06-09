export class ListCategoriesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly orgId?: string,
    public readonly search?: string,
    public readonly parentId?: string,
    public readonly isActive?: boolean,
  ) {}
}
