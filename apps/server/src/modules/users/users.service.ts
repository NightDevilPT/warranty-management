import { CommandBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { CreateUserCommand } from './commands/impl/create-user.command';
import { VerifyUserCommand } from './commands/impl/verify-user.command';
import { LoginUserCommand } from './commands/impl/login-user.command';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { ForgetPasswordCommand } from './commands/impl/forget-password.command';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordCommand } from './commands/impl/update-password.command';

@Injectable()
export class UsersService {
  constructor(private readonly commandBus: CommandBus) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  async verifyUser(token: string, email: string): Promise<UserResponseDto> {
    return this.commandBus.execute(new VerifyUserCommand(token, email));
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<any> {
    return this.commandBus.execute(new LoginUserCommand(loginUserDto));
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.commandBus.execute(
      new UpdateUserCommand(userId, updateUserDto),
    );
  }

  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    return this.commandBus.execute(
      new ForgetPasswordCommand(forgetPasswordDto),
    );
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    return this.commandBus.execute(new UpdatePasswordCommand(updatePasswordDto));
  }
}
