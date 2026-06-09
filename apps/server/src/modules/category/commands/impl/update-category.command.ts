import { UpdateCategoryDto } from '../../dto/update-category.dto';

export class UpdateCategoryCommand {
  constructor(
    public readonly categoryId: string,
    public readonly dto: UpdateCategoryDto,
    public readonly userId: string,
  ) {}
}
