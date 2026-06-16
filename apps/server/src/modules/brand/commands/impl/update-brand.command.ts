// src/modules/brand/commands/impl/update-brand.command.ts
import { UpdateBrandDto } from '../../dto/update-brand.dto';

export class UpdateBrandCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBrandDto,
    public readonly userId: string,
  ) {}
}
