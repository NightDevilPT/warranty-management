import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeDealerTypeDto } from './dto/change-dealer-type.dto';
import {
  UserResponseDto,
  UserDetailDto,
  InviteUserResponseDto,
  UserPermissionsResponseDto,
  ChangeDealerTypeResponseDto,
} from './dto/user-response.dto';
import { InviteUserCommand } from './commands/impl/invite-user.command';
import { UpdateUserCommand } from './commands/impl/update-user.command';
import { RemoveUserCommand } from './commands/impl/remove-user.command';
import { ChangeDealerTypeCommand } from './commands/impl/change-dealer-type.command';
import { GetUserQuery } from './queries/impl/get-user.query';
import { ListUsersQuery } from './queries/impl/list-users.query';
import { GetUserPermissionsQuery } from './queries/impl/get-user-permissions.query';

@Injectable()
export class UsersService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async invite(
    dto: InviteUserDto,
    orgId: string,
    userId: string,
  ): Promise<InviteUserResponseDto> {
    return this.commandBus.execute(new InviteUserCommand(dto, orgId, userId));
  }

  async findAll(
    orgId: string,
    page: number,
    limit: number,
    search?: string,
    role?: string,
    dealerTypeId?: string,
    partnerType?: string,
    status?: string,
  ) {
    return this.queryBus.execute(
      new ListUsersQuery(
        orgId,
        page,
        limit,
        search,
        role,
        dealerTypeId,
        partnerType,
        status,
      ),
    );
  }

  async findById(userAccessId: string, orgId: string): Promise<UserDetailDto> {
    return this.queryBus.execute(new GetUserQuery(userAccessId, orgId));
  }

  async update(
    userAccessId: string,
    dto: UpdateUserDto,
    orgId: string,
    userId: string,
  ): Promise<UserResponseDto> {
    return this.commandBus.execute(
      new UpdateUserCommand(userAccessId, dto, orgId, userId),
    );
  }

  async remove(
    userAccessId: string,
    orgId: string,
    userId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new RemoveUserCommand(userAccessId, orgId, userId),
    );
  }

  async getPermissions(
    userAccessId: string,
    orgId: string,
  ): Promise<UserPermissionsResponseDto> {
    return this.queryBus.execute(
      new GetUserPermissionsQuery(userAccessId, orgId),
    );
  }

  async changeDealerType(
    userAccessId: string,
    dto: ChangeDealerTypeDto,
    orgId: string,
    userId: string,
  ): Promise<ChangeDealerTypeResponseDto> {
    return this.commandBus.execute(
      new ChangeDealerTypeCommand(userAccessId, dto, orgId, userId),
    );
  }
}
