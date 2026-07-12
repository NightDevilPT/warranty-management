export class UploadProfilePictureCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
