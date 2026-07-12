import { UpdateDealerTypeDto } from '../../dto/update-dealer-type.dto';

export class UpdateDealerTypeCommand {
  constructor(
    public readonly dealerTypeId: string,
    public readonly dto: UpdateDealerTypeDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
