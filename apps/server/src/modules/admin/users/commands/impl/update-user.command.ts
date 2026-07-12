import { UpdateUserDto } from '../../dto/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly userAccessId: string,
    public readonly dto: UpdateUserDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
