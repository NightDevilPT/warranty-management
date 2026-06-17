// src/modules/org-user/commands/impl/add-user.command.ts
import { AddUserDto } from '../../dto/add-user.dto';

export class AddUserCommand {
  constructor(
    public readonly orgId: string,
    public readonly dto: AddUserDto,
  ) {}
}
