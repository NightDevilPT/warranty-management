import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { UpdateProfileCommand } from './commands/impl/update-profile.command';
import { UploadProfilePictureCommand } from './commands/impl/upload-profile-picture.command';
import { ChangePasswordCommand } from './commands/impl/change-password.command';
import { GetMeQuery } from './queries/impl/get-me.query';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateUserDto, adminId: string) {
    return this.commandBus.execute(new CreateUserCommand(dto, adminId));
  }

  async getMe(userId: string) {
    return this.queryBus.execute(new GetMeQuery(userId));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.commandBus.execute(new UpdateProfileCommand(userId, dto));
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    return this.commandBus.execute(
      new UploadProfilePictureCommand(userId, file),
    );
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    return this.commandBus.execute(new ChangePasswordCommand(userId, dto));
  }
}
