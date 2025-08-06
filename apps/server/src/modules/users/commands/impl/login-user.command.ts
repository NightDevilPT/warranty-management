// src/modules/users/commands/impl/login-user.command.ts

import { LoginUserDto } from '../../dto/login-user.dto';

export class LoginUserCommand {
  constructor(public readonly loginUserDto: LoginUserDto) {}
}
