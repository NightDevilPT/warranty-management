export class ListUsersQuery {
  constructor(
    public readonly orgId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly role?: string,
    public readonly dealerTypeId?: string,
    public readonly partnerType?: string,
    public readonly status?: string,
  ) {}
}
