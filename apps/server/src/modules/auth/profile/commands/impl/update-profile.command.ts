import { UpdateProfileDto } from '../../dto/update-profile.dto';

export class UpdateProfileCommand {
  constructor(
    public readonly dto: UpdateProfileDto,
    public readonly userAccessId: string,
    public readonly orgId: string,
  ) {}
}
