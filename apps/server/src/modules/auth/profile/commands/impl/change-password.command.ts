import { ChangePasswordDto } from '../../dto/change-password.dto';

export class ChangePasswordCommand {
  constructor(
    public readonly dto: ChangePasswordDto,
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
