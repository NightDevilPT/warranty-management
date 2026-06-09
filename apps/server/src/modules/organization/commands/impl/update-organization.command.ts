import { UpdateOrganizationDto } from '../../dto/update-organization.dto';

export class UpdateOrganizationCommand {
  constructor(
    public readonly orgId: string,
    public readonly dto: UpdateOrganizationDto,
    public readonly adminId: string,
  ) {}
}
