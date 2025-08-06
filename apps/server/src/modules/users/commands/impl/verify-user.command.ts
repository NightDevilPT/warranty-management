// src/modules/users/commands/impl/verify-user.command.ts
export class VerifyUserCommand {
  constructor(
    public readonly token: string,
    public readonly email: string,
  ) {}
}
