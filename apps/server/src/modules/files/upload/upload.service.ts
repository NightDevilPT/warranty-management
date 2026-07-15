import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UploadSingleFileCommand } from './commands/impl/upload-single-file.command';
import { UploadMultipleFilesCommand } from './commands/impl/upload-multiple-files.command';
import { SingleFileUploadResponseDto } from './dto/file-upload-response.dto';
import { MultipleFilesUploadResponseDto } from './dto/file-upload-response.dto';

@Injectable()
export class UploadService {
  constructor(private readonly commandBus: CommandBus) {}

  async uploadSingleFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<SingleFileUploadResponseDto> {
    return this.commandBus.execute(new UploadSingleFileCommand(file, folder));
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder?: string,
  ): Promise<MultipleFilesUploadResponseDto> {
    return this.commandBus.execute(
      new UploadMultipleFilesCommand(files, folder),
    );
  }
}
