import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GetProfileQuery } from './queries/impl/get-profile.query';
import { UpdateProfileCommand } from './commands/impl/update-profile.command';
import { ChangePasswordCommand } from './commands/impl/change-password.command';
import { UploadProfilePictureCommand } from './commands/impl/upload-profile-picture.command';

@Injectable()
export class ProfileService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getProfile(
    userAccessId: string,
    orgId: string,
  ): Promise<ProfileResponseDto> {
    return this.queryBus.execute(new GetProfileQuery(userAccessId, orgId));
  }

  async updateProfile(
    dto: UpdateProfileDto,
    userAccessId: string,
    orgId: string,
  ): Promise<ProfileResponseDto> {
    return this.commandBus.execute(
      new UpdateProfileCommand(dto, userAccessId, orgId),
    );
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
    userAccessId: string,
    orgId: string,
  ): Promise<ProfileResponseDto> {
    return this.commandBus.execute(
      new UploadProfilePictureCommand(file, userAccessId, orgId),
    );
  }

  async changePassword(
    dto: ChangePasswordDto,
    userAccessId: string,
    orgId: string,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(
      new ChangePasswordCommand(dto, userAccessId, orgId),
    );
  }
}
