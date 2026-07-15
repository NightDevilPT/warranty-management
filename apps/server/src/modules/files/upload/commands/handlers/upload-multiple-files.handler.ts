import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadMultipleFilesCommand } from '../impl/upload-multiple-files.command';
import { LoggerService } from 'services/logger/logger.service';
import { FileService } from 'services/files/file.service';
import { ErrorService } from 'services/errors/error.service';
import { MultipleFilesUploadResponseDto } from '../../dto/file-upload-response.dto';

@CommandHandler(UploadMultipleFilesCommand)
export class UploadMultipleFilesHandler
  implements ICommandHandler<UploadMultipleFilesCommand>
{
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UploadMultipleFilesHandler.name);
  }

  async execute(
    command: UploadMultipleFilesCommand,
  ): Promise<MultipleFilesUploadResponseDto> {
    const { files, folder } = command;

    try {
      const uploaded = await this.fileService.uploadFiles(
        files,
        folder || 'uploads',
      );

      this.logger.log('Files uploaded successfully', undefined, {
        count: uploaded.length,
      });

      return MultipleFilesUploadResponseDto.fromEntities(uploaded);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload files', error.stack);
      throw this.errorService.internalServerError('Failed to upload files');
    }
  }
}
