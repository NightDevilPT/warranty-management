import { CreateCategoryDto } from '../../dto/create-category.dto';

export class CreateCategoryCommand {
  constructor(
    public readonly dto: CreateCategoryDto,
    public readonly orgId: string,
    public readonly userId: string,
  ) {}
}
