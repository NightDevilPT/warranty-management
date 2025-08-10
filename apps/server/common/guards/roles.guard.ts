// src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLES } from 'src/modules/users/interface/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLES[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if user has the required roles
    if (!this.hasRequiredRoles(user, requiredRoles)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }

  private hasRequiredRoles(user: any, requiredRoles: ROLES[]): boolean {
    // If user has no roles, deny access
    if (!user.roles || !Array.isArray(user.roles)) {
      return false;
    }

    // Check if user has any of the required roles
    return user.roles.some((userRole: any) => {
      // Handle both string roles and UserRoles objects
      const role = typeof userRole === 'string' ? userRole : userRole.role;
      return requiredRoles.includes(role);
    });
  }
}
