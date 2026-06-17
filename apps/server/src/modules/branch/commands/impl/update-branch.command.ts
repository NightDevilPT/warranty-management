// src/modules/branch/commands/impl/update-branch.command.ts
import { UpdateBranchDto } from '../../dto/update-branch.dto';

export class UpdateBranchCommand {
  constructor(
    public readonly branchId: string,
    public readonly dto: UpdateBranchDto,
    public readonly userId: string,
  ) {}
}
