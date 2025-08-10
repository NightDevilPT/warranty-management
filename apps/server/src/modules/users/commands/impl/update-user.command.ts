// commands/impl/update-user.command.ts
import { UpdateUserDto } from '../../dto/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string, // or email if you use that
    public readonly updateUserDto: UpdateUserDto,
  ) {}
}
