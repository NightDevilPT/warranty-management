export class UploadMultipleFilesCommand {
  constructor(
    public readonly files: Express.Multer.File[],
    public readonly folder?: string,
  ) {}
}
