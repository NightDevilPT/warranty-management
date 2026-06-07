// src/modules/auth/commands/impl/logout.command.ts
export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly res?: any, // Express response object
  ) {}
}
