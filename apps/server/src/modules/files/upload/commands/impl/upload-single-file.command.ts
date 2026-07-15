export class UploadSingleFileCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly folder?: string,
  ) {}
}
