export class ListOrganizationsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly type?: string,
    public readonly isActive?: boolean,
  ) {}
}
