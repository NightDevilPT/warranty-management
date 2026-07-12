import { ChangeDealerTypeDto } from '../../dto/change-dealer-type.dto';

export class ChangeDealerTypeCommand {
  constructor(
    public readonly userAccessId: string,
    public readonly dto: ChangeDealerTypeDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
