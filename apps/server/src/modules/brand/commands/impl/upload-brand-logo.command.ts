// src/modules/brand/commands/impl/upload-brand-logo.command.ts
export class UploadBrandLogoCommand {
  constructor(
    public readonly id: string,
    public readonly file: Express.Multer.File,
    public readonly userId: string,
  ) {}
}
