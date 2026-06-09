import { UpdateFeatureStatusDto } from '../../dto/update-feature-status.dto';

export class UpdateFeatureStatusCommand {
  constructor(
    public readonly featureId: string,
    public readonly dto: UpdateFeatureStatusDto,
    public readonly adminId: string,
  ) {}
}
