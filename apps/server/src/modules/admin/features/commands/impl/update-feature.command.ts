import { UpdateFeatureDto } from '../../dto/update-feature.dto';

export class UpdateFeatureCommand {
  constructor(
    public readonly featureId: string,
    public readonly dto: UpdateFeatureDto,
    public readonly userId: string,
  ) {}
}
