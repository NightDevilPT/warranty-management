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
        where: {
          id: query.userId,
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          fullName: true,
          role: true,
          emailVerified: true,
          phoneVerified: true,
          isActive: true,
          profile: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw this.errorService.notFound('User not found');
      }

      if (!user.isActive) {
        throw this.errorService.forbidden('Account is deactivated');
      }

      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error.status) throw error;
      this.logger.error('Failed to fetch user profile', error.stack);
      throw this.errorService.internalServerError(
        'Failed to fetch user profile',
      );
    }
  }
}
