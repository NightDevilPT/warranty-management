// src/middleware/guards/tenant.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'services/prisma/prisma.service';
import { LoggerService } from 'services/logger/logger.service';
import { ErrorService } from 'services/errors/error.service';
import { IS_PUBLIC_KEY } from 'decorators/public.decorator';
import { REQUIRED_FEATURE_KEY } from 'decorators/required-feature.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly errorService: ErrorService,
    private readonly reflector: Reflector,
  ) {
    this.logger.setContext(TenantGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ============================================
    // STEP 0: Skip for public routes
    // ============================================
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const user = request.user;
    if (!user) {
      throw this.errorService.unauthorized(
        'User not authenticated. JwtAuthGuard must run first.',
      );
    }

    const routePath = request.route?.path || '';
    const isAdminRoute = routePath.startsWith('/api/admin');
    const isConsumerRoute = routePath.includes('/consumer/');
    const isAuthRoute = routePath.startsWith('/api/auth');
    const isFileRoute = routePath.startsWith('/api/files');

    // ============================================
    // STEP 1: Auth & File routes - only need JWT, no tenant check
    // ============================================
    if (isAuthRoute || isFileRoute) {
      return true;
    }

    // ============================================
    // STEP 2: ADMIN USER - Full access everywhere
    // ============================================
    if (user.role === 'ADMIN') {
      // Admin routes - no org context needed
      if (isAdminRoute) {
        return true;
      }

      // Admin accessing company/consumer routes - read-only view
      const orgSlug = request.params?.slug;
      if (orgSlug) {
        const organization = await this.prisma.organization.findFirst({
          where: { slug: orgSlug, deletedAt: null },
        });

        if (!organization) {
          throw this.errorService.notFound(
            `Organization '${orgSlug}' not found`,
          );
        }

        // Attach org context for admin viewing
        request.user = {
          ...user,
          orgId: organization.id,
          orgSlug: organization.slug,
          portalType: isConsumerRoute ? 'CONSUMER' : 'COMPANY',
          isAdminView: true,
        };

        this.logger.debug('ADMIN viewing organization data', undefined, {
          userId: user.id,
          orgId: organization.id,
        });
        return true;
      }

      return true;
    }

    // ============================================
    // STEP 3: NON-ADMIN - Validate organization from URL slug
    // ============================================
    const orgSlug = request.params?.slug;
    if (!orgSlug) {
      throw this.errorService.forbidden('Organization context is required');
    }

    // Find organization
    const organization = await this.prisma.organization.findFirst({
      where: {
        slug: orgSlug,
        deletedAt: null,
      },
    });

    if (!organization) {
      throw this.errorService.notFound(`Organization '${orgSlug}' not found`);
    }

    if (!organization.isActive) {
      throw this.errorService.forbidden(
        `Organization '${orgSlug}' is currently disabled`,
      );
    }

    // ============================================
    // STEP 4: Check user has access to this organization
    // ============================================
    const userAccess = await this.prisma.userAccess.findFirst({
      where: {
        userId: user.id,
        orgId: organization.id,
        deletedAt: null,
      },
    });

    if (!userAccess) {
      throw this.errorService.forbidden(
        `You do not have access to organization '${orgSlug}'`,
      );
    }

    // ============================================
    // STEP 5: Verify portal type matches route
    // ============================================
    const expectedPortalType = isConsumerRoute ? 'CONSUMER' : 'COMPANY';

    if (userAccess.portalType !== expectedPortalType) {
      throw this.errorService.forbidden(
        `Invalid portal access. Expected ${expectedPortalType} access.`,
      );
    }

    // ============================================
    // STEP 6: Attach resolved organization context
    // ============================================
    request.user = {
      ...user,
      orgId: organization.id,
      orgSlug: organization.slug,
      portalType: userAccess.portalType,
      role: userAccess.role,
      partnerType: userAccess.partnerType,
      dealerTypeId: userAccess.dealerTypeId,
    };

    // ============================================
    // STEP 7: COMPANY_SUPER_ADMIN - Full org access, skip feature check
    // ============================================
    if (userAccess.role === 'COMPANY_SUPER_ADMIN') {
      this.logger.debug('COMPANY_SUPER_ADMIN - full org access', undefined, {
        userId: user.id,
        orgId: organization.id,
      });
      return true;
    }

    // ============================================
    // STEP 8: Check feature/permission if required
    // ============================================
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRED_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredFeature) {
      const userPermissions = user.permissions || [];

      if (!userPermissions.includes(requiredFeature)) {
        this.logger.warn('Feature access denied', undefined, {
          userId: user.id,
          orgId: organization.id,
          requiredFeature,
          userPermissions,
        });

        throw this.errorService.forbidden(
          `You do not have the required permission: ${requiredFeature}`,
        );
      }

      this.logger.debug('Feature check passed', undefined, {
        userId: user.id,
        requiredFeature,
      });
    }

    this.logger.debug('Tenant check passed', undefined, {
      userId: user.id,
      orgId: organization.id,
      role: userAccess.role,
    });

    return true;
  }
}
