import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadProfilePictureCommand } from '../impl/upload-profile-picture.command';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { FileService } from 'services/files/file.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@CommandHandler(UploadProfilePictureCommand)
export class UploadProfilePictureHandler
  implements ICommandHandler<UploadProfilePictureCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(UploadProfilePictureHandler.name);
  }

  async execute(
    command: UploadProfilePictureCommand,
  ): Promise<UserResponseDto> {
    const { userId, file } = command;
    this.logger.log('Executing UploadProfilePictureCommand', undefined, {
      userId,
      fileName: file.originalname,
    });

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId, deletedAt: null },
      });

      if (!existingUser) {
        throw this.errorService.notFound('User not found');
      }

      // Delete old profile picture if exists
      if (existingUser.profile) {
        try {
          await this.fileService.deleteFile(existingUser.profile);
        } catch (deleteError) {
          this.logger.warn('Failed to delete old profile picture', undefined, {
            error: deleteError.message,
          });
        }
      }

      // Upload new profile picture
      const uploadedFile = await this.fileService.uploadFile(file, 'profiles');

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { profile: uploadedFile.url },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          fullName: true,
          role: true,
          emailVerified: true,
          phoneVerified: true,
          isActive: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log('Profile picture uploaded successfully', undefined, {
        userId,
      });
      return UserResponseDto.fromEntity(updatedUser);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to upload profile picture', error.stack);
      throw this.errorService.internalServerError(
        'Failed to upload profile picture',
      );
    }
  }
}
