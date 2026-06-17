// src/modules/org-user/org-user.service.ts
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AddUserDto } from './dto/add-user.dto';
import { OrgUserResponseDto } from './dto/org-user-response.dto';
import { AddUserCommand } from './commands/impl/add-user.command';
import { UpdateOrgUserCommand } from './commands/impl/update-org-user.command';
import { RemoveUserCommand } from './commands/impl/remove-user.command';
import { GetOrgUserQuery } from './queries/impl/get-org-user.query';
import { ListOrgUsersQuery } from './queries/impl/list-org-users.query';
import { GetUserFeaturesQuery } from './queries/impl/get-user-features.query';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';
import { GetMyPermissionsQuery } from './queries/impl/get-my-permissions.query';

@Injectable()
export class OrgUserService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async addUser(orgId: string, dto: AddUserDto): Promise<OrgUserResponseDto> {
    return this.commandBus.execute(new AddUserCommand(orgId, dto));
  }

  async findAll(
    orgId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    portalType?: string,
  ) {
    return this.queryBus.execute(
      new ListOrgUsersQuery(orgId, page, limit, search, role, portalType),
    );
  }

  async findById(orgId: string, userId: string): Promise<OrgUserResponseDto> {
    return this.queryBus.execute(new GetOrgUserQuery(orgId, userId));
  }

  async update(
    orgId: string,
    userId: string,
    dto: UpdateOrgUserDto,
    currentUserId: string,
  ): Promise<OrgUserResponseDto> {
    return this.commandBus.execute(
      new UpdateOrgUserCommand(orgId, userId, dto, currentUserId),
    );
  }

  async remove(orgId: string, userId: string): Promise<{ message: string }> {
    return this.commandBus.execute(new RemoveUserCommand(orgId, userId));
  }

  async getUserFeatures(orgId: string, userId: string) {
    return this.queryBus.execute(new GetUserFeaturesQuery(orgId, userId));
  }

  async getMyPermissions(orgId: string, userId: string) {
    return this.queryBus.execute(new GetMyPermissionsQuery(orgId, userId));
  }
}
