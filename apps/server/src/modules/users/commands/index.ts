// src/modules/users/commands/index.ts
import { LoginUserHandler } from './handler/login-user.command.handler';
import { VerifyUserHandler } from './handler/verify-user.command.handler';
import { CreateUserHandler } from './handler/create-user.command.handler';
import { UpdateUserHandler } from './handler/update-user.command.handler';
import { ForgetPasswordHandler } from './handler/forget-password.command.handler';
import { UpdatePasswordHandler } from './handler/update-password.command.handler';

export const UserCommandHandlers = [
  CreateUserHandler,
  VerifyUserHandler,
  LoginUserHandler,
  UpdateUserHandler,
  ForgetPasswordHandler,
  UpdatePasswordHandler,
];
