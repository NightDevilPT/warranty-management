import { InviteSuperAdminDto } from '../../dto/invite-super-admin.dto';

export class InviteSuperAdminCommand {
  constructor(
    public readonly orgId: string,
    public readonly dto: InviteSuperAdminDto,
    public readonly userId: string,
  ) {}
}
