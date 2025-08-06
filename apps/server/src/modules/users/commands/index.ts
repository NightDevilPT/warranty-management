// src/modules/users/commands/index.ts
import { CreateUserHandler } from './handler/create-user.command.handler';
import { VerifyUserHandler } from './handler/verify-user.command.handler';

export const UserCommandHandlers = [CreateUserHandler, VerifyUserHandler];
