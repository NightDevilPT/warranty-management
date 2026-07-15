import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadSingleFileCommand } from '../impl/upload-single-file.command';
import { LoggerService } from 'services/logger/logger.service';
import { FileService } from 'services/files/file.service';
import { ErrorService } from 'services/errors/error.service';
import { SingleFileUploadResponseDto } from '../../dto/file-upload-response.dto';

@CommandHandler(UploadSingleFileCommand)
export class UploadSingleFileHandler
  implements ICommandHandler<UploadSingleFileCommand>
{
  constructor(
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UploadSingleFileHandler.name);
  }

  async execute(
    command: UploadSingleFileCommand,
  ): Promise<SingleFileUploadResponseDto> {
    const { file, folder } = command;

    try {
      const uploaded = await this.fileService.uploadFile(
        file,
        folder || 'uploads',
      );

      this.logger.log('File uploaded successfully', undefined, {
        key: uploaded.key,
        size: uploaded.size,
      });

      return SingleFileUploadResponseDto.fromEntity(uploaded);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload file', error.stack);
      throw this.errorService.internalServerError('Failed to upload file');
    }
  }
}
