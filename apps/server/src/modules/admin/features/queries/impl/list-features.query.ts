export class ListFeaturesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly search?: string,
    public readonly status?: string,
    public readonly parentId?: string,
  ) {}
}
