// src/modules/branch/commands/impl/upload-branch-logo.command.ts
export class UploadBranchLogoCommand {
  constructor(
    public readonly branchId: string,
    public readonly file: Express.Multer.File,
    public readonly userId: string,
  ) {}
}
