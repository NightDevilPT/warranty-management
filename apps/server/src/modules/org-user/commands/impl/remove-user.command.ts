// src/modules/org-user/commands/impl/remove-user.command.ts
export class RemoveUserCommand {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
