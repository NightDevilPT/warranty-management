// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ROLES } from 'src/modules/users/interface/user.interface';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ROLES[]) => SetMetadata(ROLES_KEY, roles);
