import { UpdatePermissionsDto } from '../../dto/update-permissions.dto';

export class UpdatePermissionsCommand {
  constructor(
    public readonly dealerTypeId: string,
    public readonly dto: UpdatePermissionsDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
