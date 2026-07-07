import { CreateDealerTypeDto } from '../../dto/create-dealer-type.dto';

export class CreateDealerTypeCommand {
  constructor(
    public readonly dto: CreateDealerTypeDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
