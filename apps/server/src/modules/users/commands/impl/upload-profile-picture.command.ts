// apps/server/src/modules/users/commands/impl/upload-profile-picture.command.ts

export class UploadProfilePictureCommand {
  constructor(
    public readonly userId: string,
    public readonly file: Express.Multer.File,
  ) {}
}
