// src/modules/auth/commands/impl/login.command.ts
import { LoginDto } from '../../dto/login.dto';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}
