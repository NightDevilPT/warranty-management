// src/modules/users/commands/impl/update-me.command.ts

import { UpdateMeDto } from '../../dto/update-user.dto';

export class UpdateMeCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateMeDto,
  ) {}
}
