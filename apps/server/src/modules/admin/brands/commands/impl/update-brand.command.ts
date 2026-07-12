import { UpdateBrandDto } from '../../dto/update-brand.dto';

export class UpdateBrandCommand {
  constructor(
    public readonly brandId: string,
    public readonly dto: UpdateBrandDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
