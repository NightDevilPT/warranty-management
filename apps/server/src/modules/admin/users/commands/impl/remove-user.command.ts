export class RemoveUserCommand {
  constructor(
    public readonly userAccessId: string,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
