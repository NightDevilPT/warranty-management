// prisma/seed/features/index.ts

import { PrismaClient } from '../../../generated/prisma/client';
import { seedLogger } from '../utils/logger';

interface FeatureSeed {
  name: string;
  code: string;
  description: string;
  icon: string;
  parentCode?: string;
  sortOrder: number;
  status: 'ENABLED' | 'DISABLED' | 'COMING_SOON';
}

// Features that can be assigned to organization users via DealerTypes
const featureSeeds: FeatureSeed[] = [
  // ============================================
  // MODULE 1: Dashboard
  // ============================================
  {
    name: 'Dashboard',
    code: 'DASHBOARD',
    description: 'Dashboard analytics and metrics',
    icon: 'LayoutDashboard',
    sortOrder: 1,
    status: 'ENABLED',
  },
  {
    name: 'View Dashboard',
    code: 'DASHBOARD_VIEW',
    description: 'Access and view the dashboard',
    icon: 'Gauge',
    parentCode: 'DASHBOARD',
    sortOrder: 1,
    status: 'ENABLED',
  },

  // ============================================
  // MODULE 2: Brand Management
  // ============================================
  {
    name: 'Brand Management',
    code: 'BRAND',
    description: 'Manage product brands',
    icon: 'Tag',
    sortOrder: 2,
    status: 'ENABLED',
  },
  {
    name: 'Create Brand',
    code: 'BRAND_CREATE',
    description: 'Add new brands to the catalog',
    icon: 'PlusCircle',
    parentCode: 'BRAND',
    sortOrder: 1,
    status: 'ENABLED',
  },
  {
    name: 'View Brands',
    code: 'BRAND_VIEW',
    description: 'View brand list and details',
    icon: 'Eye',
    parentCode: 'BRAND',
    sortOrder: 2,
    status: 'ENABLED',
  },
  {
    name: 'Update Brand',
    code: 'BRAND_UPDATE',
    description: 'Modify brand information',
    icon: 'Pencil',
    parentCode: 'BRAND',
    sortOrder: 3,
    status: 'ENABLED',
  },
  {
    name: 'Delete Brand',
    code: 'BRAND_DELETE',
    description: 'Soft delete brands',
    icon: 'Trash2',
    parentCode: 'BRAND',
    sortOrder: 4,
    status: 'ENABLED',
  },

  // ============================================
  // MODULE 3: Category Management
  // ============================================
  {
    name: 'Category Management',
    code: 'CATEGORY',
    description: 'Manage product categories hierarchy',
    icon: 'FolderTree',
    sortOrder: 3,
    status: 'ENABLED',
  },
  {
    name: 'Create Category',
    code: 'CATEGORY_CREATE',
    description: 'Create new categories',
    icon: 'PlusCircle',
    parentCode: 'CATEGORY',
    sortOrder: 1,
    status: 'ENABLED',
  },
  {
    name: 'View Categories',
    code: 'CATEGORY_VIEW',
    description: 'View category tree and details',
    icon: 'Eye',
    parentCode: 'CATEGORY',
    sortOrder: 2,
    status: 'ENABLED',
  },
  {
    name: 'Update Category',
    code: 'CATEGORY_UPDATE',
    description: 'Modify categories and hierarchy',
    icon: 'Pencil',
    parentCode: 'CATEGORY',
    sortOrder: 3,
    status: 'ENABLED',
  },
  {
    name: 'Delete Category',
    code: 'CATEGORY_DELETE',
    description: 'Soft delete categories',
    icon: 'Trash2',
    parentCode: 'CATEGORY',
    sortOrder: 4,
    status: 'ENABLED',
  },

  // ============================================
  // MODULE 4: Dealer Type Management
  // ============================================
  {
    name: 'Dealer Type Management',
    code: 'DEALER_TYPE',
    description: 'Manage role templates and permissions',
    icon: 'Users',
    sortOrder: 4,
    status: 'ENABLED',
  },
  {
    name: 'Create Dealer Type',
    code: 'DEALER_TYPE_CREATE',
    description: 'Create new role templates',
    icon: 'PlusCircle',
    parentCode: 'DEALER_TYPE',
    sortOrder: 1,
    status: 'ENABLED',
  },
  {
    name: 'View Dealer Types',
    code: 'DEALER_TYPE_VIEW',
    description: 'View role templates and details',
    icon: 'Eye',
    parentCode: 'DEALER_TYPE',
    sortOrder: 2,
    status: 'ENABLED',
  },
  {
    name: 'Update Dealer Type',
    code: 'DEALER_TYPE_UPDATE',
    description: 'Modify role template details',
    icon: 'Pencil',
    parentCode: 'DEALER_TYPE',
    sortOrder: 3,
    status: 'ENABLED',
  },
  {
    name: 'Delete Dealer Type',
    code: 'DEALER_TYPE_DELETE',
    description: 'Soft delete role templates',
    icon: 'Trash2',
    parentCode: 'DEALER_TYPE',
    sortOrder: 4,
    status: 'ENABLED',
  },
  {
    name: 'Manage Permissions',
    code: 'DEALER_TYPE_PERMISSIONS',
    description: 'Assign features to role templates',
    icon: 'Lock',
    parentCode: 'DEALER_TYPE',
    sortOrder: 5,
    status: 'ENABLED',
  },

  // ============================================
  // MODULE 5: User Management
  // ============================================
  {
    name: 'User Management',
    code: 'USER',
    description: 'Manage organization users and partners',
    icon: 'UserCog',
    sortOrder: 5,
    status: 'ENABLED',
  },
  {
    name: 'Invite Internal Staff',
    code: 'USER_INVITE_INTERNAL',
    description: 'Invite employees to the organization (COMPANY_STAFF)',
    icon: 'UserPlus',
    parentCode: 'USER',
    sortOrder: 1,
    status: 'ENABLED',
  },
  {
    name: 'Invite External Partner',
    code: 'USER_INVITE_EXTERNAL',
    description:
      'Invite dealers/partners to the organization (COMPANY_PARTNER)',
    icon: 'UserRoundPlus',
    parentCode: 'USER',
    sortOrder: 2,
    status: 'ENABLED',
  },
  {
    name: 'View Users',
    code: 'USER_VIEW',
    description: 'View list and details of all users',
    icon: 'Eye',
    parentCode: 'USER',
    sortOrder: 3,
    status: 'ENABLED',
  },
  {
    name: 'Update User Access',
    code: 'USER_UPDATE',
    description: 'Modify user role, partner type, or dealer type',
    icon: 'Pencil',
    parentCode: 'USER',
    sortOrder: 4,
    status: 'ENABLED',
  },
  {
    name: 'Remove User',
    code: 'USER_DELETE',
    description: 'Remove user from organization',
    icon: 'UserMinus',
    parentCode: 'USER',
    sortOrder: 5,
    status: 'ENABLED',
  },
  {
    name: 'View User Permissions',
    code: 'USER_PERMISSIONS_VIEW',
    description: 'View effective permissions for a user',
    icon: 'ShieldCheck',
    parentCode: 'USER',
    sortOrder: 6,
    status: 'ENABLED',
  },
  {
    name: 'Change Dealer Type',
    code: 'USER_CHANGE_DEALER_TYPE',
    description: 'Reassign user to different role template',
    icon: 'ArrowLeftRight',
    parentCode: 'USER',
    sortOrder: 7,
    status: 'ENABLED',
  },
];

export async function seedFeatures(prisma: PrismaClient) {
  seedLogger.info('🌱 Seeding features and permissions...');

  let createdCount = 0;
  let skippedCount = 0;

  const rootFeatures = featureSeeds.filter((f) => !f.parentCode);
  const childFeatures = featureSeeds.filter((f) => f.parentCode);

  // First pass: Create root modules
  for (const feature of rootFeatures) {
    const existing = await prisma.feature.findUnique({
      where: { code: feature.code },
    });

    if (!existing) {
      await prisma.feature.create({
        data: {
          name: feature.name,
          code: feature.code,
          description: feature.description,
          icon: feature.icon,
          parentId: null,
          sortOrder: feature.sortOrder,
          status: feature.status,
        },
      });
      createdCount++;
      seedLogger.info(`  ✅ Module: ${feature.name} (${feature.code})`);
    } else {
      skippedCount++;
    }
  }

  // Second pass: Create child permissions
  for (const feature of childFeatures) {
    const existing = await prisma.feature.findUnique({
      where: { code: feature.code },
    });

    if (!existing) {
      const parent = await prisma.feature.findUnique({
        where: { code: feature.parentCode! },
      });

      if (parent) {
        await prisma.feature.create({
          data: {
            name: feature.name,
            code: feature.code,
            description: feature.description,
            icon: feature.icon,
            parentId: parent.id,
            sortOrder: feature.sortOrder,
            status: feature.status,
          },
        });
        createdCount++;
        seedLogger.info(`  ✅ Permission: ${feature.name} (${feature.code})`);
      }
    } else {
      skippedCount++;
    }
  }

  seedLogger.info(
    `✅ Features: ${createdCount} created, ${skippedCount} skipped`,
  );
}
