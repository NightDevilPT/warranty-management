import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { ProfilePictureResponseDto } from './dto/profile-picture-response.dto';
import { UploadProfilePictureCommand } from './commands/impl/upload-profile-picture.command';

@Injectable()
export class UsersService {
  constructor(private readonly commandBus: CommandBus) {}

  async createUser(createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ProfilePictureResponseDto> {
    return this.commandBus.execute(
      new UploadProfilePictureCommand(userId, file),
    );
  }
}
