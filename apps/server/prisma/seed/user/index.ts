// prisma/seed/user/index.ts

import { PrismaClient } from '../../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { seedLogger } from '../utils/logger';

export async function seedUsers(prisma: PrismaClient) {
  seedLogger.info('👤 Seeding platform admin user...');

  const systemHash = 'admin01'; // Fixed hash for admin

  // Create a system organization for admin
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'System',
      companyName: 'Warranty Management Platform',
      slug: 'system',
      type: 'ROOT',
      hash: systemHash,
      isActive: true,
    },
  });

  seedLogger.info(
    `System organization created: ${systemOrg.name} (Hash: ${systemOrg.hash})`,
  );

  // Create global user for admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@warranty.com' },
    update: {},
    create: {
      email: 'admin@warranty.com',
      isActive: true,
    },
  });

  seedLogger.info(`Global user created: ${adminUser.email}`);

  // Hash admin password
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // Create admin UserAccess linked to system organization
  const adminAccess = await prisma.userAccess.upsert({
    where: {
      userId_orgId_portalType: {
        userId: adminUser.id,
        orgId: systemOrg.id,
        portalType: 'admin',
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      orgId: systemOrg.id,
      portalType: 'admin',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      fullName: 'System Administrator',
      phoneNumber: null,
      role: 'ADMIN',
      partnerType: null,
      dealerTypeId: null,
      emailVerified: true,
      phoneVerified: false,
      isActive: true,
    },
  });

  seedLogger.info(
    `Admin profile created: ${adminAccess.fullName} (${adminAccess.role})`,
  );

  // Update system organization with creator reference
  await prisma.organization.update({
    where: { id: systemOrg.id },
    data: {
      createdBy: adminAccess.id,
      updatedBy: adminAccess.id,
    },
  });

  seedLogger.info('Admin user seeding completed!');

  return {
    id: adminUser.id,
    userAccessId: adminAccess.id,
    fullName: adminAccess.fullName,
    email: adminUser.email,
    role: adminAccess.role,
    portalType: adminAccess.portalType,
    organizationHash: systemOrg.hash,
    organizationName: systemOrg.name,
  };
}
