import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { VerifyUserCommand } from './commands/impl/verify-user.command';

@Injectable()
export class UsersService {
  constructor(private readonly commandBus: CommandBus) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  async verifyUser(token: string, email: string): Promise<UserResponseDto> {
    return this.commandBus.execute(new VerifyUserCommand(token, email));
  }
}
