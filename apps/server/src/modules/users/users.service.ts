// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { UpdateMeCommand } from './commands/impl/update-me.command';
import { UploadProfilePictureCommand } from './commands/impl/upload-profile-picture.command';
import { GetMeQuery } from './queries/impl/get-me.query';
import { UpdateMeDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetMeQuery(userId));
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<UserResponseDto> {
    return this.commandBus.execute(new UpdateMeCommand(userId, dto));
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    return this.commandBus.execute(
      new UploadProfilePictureCommand(userId, file),
    );
  }
}
