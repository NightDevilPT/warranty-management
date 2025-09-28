// src/users/services/user.service.ts
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'services/prisma/prisma-service.service';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/impl/create-user.command';

@Injectable()
export class UsersService {
  constructor(private readonly commandBus: CommandBus) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto | null> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }
}
