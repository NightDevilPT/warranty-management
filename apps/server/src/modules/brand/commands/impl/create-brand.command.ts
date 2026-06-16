// src/modules/brand/commands/impl/create-brand.command.ts
import { CreateBrandDto } from '../../dto/create-brand.dto';

export class CreateBrandCommand {
  constructor(
    public readonly dto: CreateBrandDto,
    public readonly userId: string,
  ) {}
}
