// src/middleware/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'decorators/roles.decorator';
import { UserRole } from 'generated/prisma/enums';
import { ErrorService } from 'services/errors/error.service';
import { LoggerService } from 'services/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
  ) {
    this.logger.setContext(RolesGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific roles are required, allow access (JwtAuthGuard already ensured they are logged in)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.error(
        'RolesGuard executed but no user found. JwtAuthGuard must run first.',
      );
      throw this.errorService.unauthorized('User context is missing.');
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      this.logger.warn(
        `Access denied. User role '${user.role}' lacks required roles: ${requiredRoles.join(', ')}`,
      );
      throw this.errorService.forbidden(
        'You do not have the required permissions to perform this action.',
      );
    }

    return true;
  }
}
