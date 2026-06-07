// apps/server/src/modules/users/commands/handlers/upload-profile-picture.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadProfilePictureCommand } from '../impl/upload-profile-picture.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { ProfilePictureResponseDto } from '../../dto/profile-picture-response.dto';
import { FileService } from 'services/files/file.service';

@CommandHandler(UploadProfilePictureCommand)
export class UploadProfilePictureHandler
  implements ICommandHandler<UploadProfilePictureCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(UploadProfilePictureHandler.name);
  }

  async execute(
    command: UploadProfilePictureCommand,
  ): Promise<ProfilePictureResponseDto> {
    const { userId, file } = command;

    this.logger.log('Executing UploadProfilePictureCommand', undefined, {
      userId,
      fileName: file.originalname,
    });

    try {
      // 1. Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      // 2. Delete old profile picture if exists
      if (user.profile) {
        try {
          const oldKey = this.extractKeyFromUrl(user.profile);
          if (oldKey) {
            await this.fileService.deleteFile(oldKey);
            this.logger.log(`Old profile picture deleted: ${oldKey}`);
          }
        } catch (error) {
          this.logger.warn(
            `Failed to delete old profile picture: ${error.message}`,
          );
        }
      }

      // 3. Upload new profile picture
      const uploadedFile = await this.fileService.uploadFile(file, 'profiles');

      // 4. Update user profile URL in database
      await this.prisma.user.update({
        where: { id: userId },
        data: { profile: uploadedFile.url },
      });

      this.logger.log('Profile picture uploaded successfully', undefined, {
        userId,
        profileUrl: uploadedFile.url,
      });

      // 5. Return just the profile URL
      return new ProfilePictureResponseDto(uploadedFile.url);
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Failed to upload profile picture', error.stack);
      throw this.errorService.internalServerError(
        'Failed to upload profile picture',
      );
    }
  }

  /**
   * Extract S3 key from the stored URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex((part) =>
        part.includes('warranty-system-uploads'),
      );

      if (bucketIndex !== -1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }

      return null;
    } catch {
      return null;
    }
  }
}
