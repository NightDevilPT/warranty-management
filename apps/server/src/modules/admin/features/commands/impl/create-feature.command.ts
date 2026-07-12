import { CreateFeatureDto } from '../../dto/create-feature.dto';

export class CreateFeatureCommand {
  constructor(
    public readonly dto: CreateFeatureDto,
    public readonly userId: string,
  ) {}
}
