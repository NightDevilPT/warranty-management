export class UploadOrganizationLogoCommand {
  constructor(
    public readonly orgId: string,
    public readonly file: Express.Multer.File,
    public readonly userId: string,
  ) {}
}
