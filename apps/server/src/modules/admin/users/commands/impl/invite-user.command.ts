import { InviteUserDto } from '../../dto/invite-user.dto';

export class InviteUserCommand {
  constructor(
    public readonly dto: InviteUserDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
