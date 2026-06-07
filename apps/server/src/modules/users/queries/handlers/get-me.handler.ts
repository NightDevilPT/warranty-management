// src/modules/users/queries/handlers/get-me.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from '../impl/get-me.query';
import { LoggerService } from 'services/logger/logger.service';
import { PrismaService } from 'services/prisma/prisma.service';
import { ErrorService } from 'services/errors/error.service';
import { UserResponseDto } from '../../dto/user-response.dto';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(GetMeHandler.name);
  }

  async execute(query: GetMeQuery): Promise<UserResponseDto> {
    this.logger.log('Executing GetMeQuery', undefined, {
      userId: query.userId,
    });

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: query.userId },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      if (!user.isActive || user.deletedAt) {
        throw this.errorService.forbidden('Account is not active');
      }

      this.logger.log('Get profile successful', undefined, {
        userId: user.id,
      });

      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error.status) throw error;

      this.logger.error('Failed to get profile', error.stack);
      throw this.errorService.internalServerError('Failed to get profile');
    }
  }
}
