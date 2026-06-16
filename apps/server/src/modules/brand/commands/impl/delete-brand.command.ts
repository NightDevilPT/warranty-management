// src/modules/brand/commands/impl/delete-brand.command.ts
export class DeleteBrandCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
