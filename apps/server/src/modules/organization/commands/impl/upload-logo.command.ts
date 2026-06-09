export class UploadLogoCommand {
  constructor(
    public readonly orgId: string,
    public readonly file: Express.Multer.File,
  ) {}
}
