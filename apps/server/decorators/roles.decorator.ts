import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums'; // Adjust path if needed

// 1. Export the constant so the Guard can read it
export const ROLES_KEY = 'roles';

// 2. Export the decorator so the Controllers can use it
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
