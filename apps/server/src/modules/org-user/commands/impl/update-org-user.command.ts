// src/modules/org-user/commands/impl/update-org-user.command.ts
import { UpdateOrgUserDto } from '../../dto/update-org-user.dto';

export class UpdateOrgUserCommand {
  constructor(
    public readonly orgId: string,
    public readonly userId: string,
    public readonly dto: UpdateOrgUserDto,
    public readonly currentUserId: string,
  ) {}
}
