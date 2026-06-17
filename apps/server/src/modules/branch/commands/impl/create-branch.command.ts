// src/modules/branch/commands/impl/create-branch.command.ts
import { CreateBranchDto } from '../../dto/create-branch.dto';

export class CreateBranchCommand {
  constructor(
    public readonly parentOrgId: string, // Changed from parentSlug
    public readonly dto: CreateBranchDto,
    public readonly userId: string,
  ) {}
}
