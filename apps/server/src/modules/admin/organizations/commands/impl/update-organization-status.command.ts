import { UpdateOrganizationStatusDto } from '../../dto/update-organization-status.dto';

export class UpdateOrganizationStatusCommand {
  constructor(
    public readonly orgId: string,
    public readonly dto: UpdateOrganizationStatusDto,
    public readonly userId: string,
  ) {}
}
