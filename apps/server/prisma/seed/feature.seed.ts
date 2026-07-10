import { PrismaClient } from '../../generated/prisma/client';

const featureHierarchy: any[] = [
  {
    name: 'Dashboard',
    code: 'DASHBOARD',
    description: 'View dashboard and analytics',
    icon: 'layout-dashboard',
    sortOrder: 1,
    children: [
      {
        name: 'Read',
        code: 'DASHBOARD_READ',
        description: 'View main dashboard with statistics',
        icon: 'chart-bar',
        sortOrder: 1,
      },
      {
        name: 'Read Reports',
        code: 'DASHBOARD_READ_REPORTS',
        description: 'View detailed reports and analytics',
        icon: 'report',
        sortOrder: 2,
      },
    ],
  },
  {
    name: 'Organization Management',
    code: 'ORGANIZATION',
    description: 'Manage organizations and branches',
    icon: 'building',
    sortOrder: 2,
    children: [
      {
        name: 'Create',
        code: 'ORGANIZATION_CREATE',
        description: 'Create new organizations',
        icon: 'plus-circle',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'ORGANIZATION_READ',
        description: 'View organization details',
        icon: 'eye',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'ORGANIZATION_UPDATE',
        description: 'Update organization information',
        icon: 'edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'ORGANIZATION_DELETE',
        description: 'Delete organizations',
        icon: 'trash',
        sortOrder: 4,
      },
      {
        name: 'Manage Branches',
        code: 'ORGANIZATION_MANAGE_BRANCHES',
        description: 'Create and manage branch organizations',
        icon: 'git-branch',
        sortOrder: 5,
      },
    ],
  },
  {
    name: 'User Management',
    code: 'USER',
    description: 'Manage users and their access',
    icon: 'users',
    sortOrder: 3,
    children: [
      {
        name: 'Create',
        code: 'USER_CREATE',
        description: 'Create new users',
        icon: 'user-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'USER_READ',
        description: 'View user list and details',
        icon: 'user-check',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'USER_UPDATE',
        description: 'Update user information and roles',
        icon: 'user-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'USER_DELETE',
        description: 'Delete users from system',
        icon: 'user-x',
        sortOrder: 4,
      },
      {
        name: 'Assign Features',
        code: 'USER_ASSIGN_FEATURES',
        description: 'Assign features/permissions to users',
        icon: 'shield',
        sortOrder: 5,
      },
    ],
  },
  {
    name: 'Feature Management',
    code: 'FEATURE',
    description: 'Manage features and permissions',
    icon: 'key',
    sortOrder: 4,
    children: [
      {
        name: 'Create',
        code: 'FEATURE_CREATE',
        description: 'Create new features/modules',
        icon: 'plus-square',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'FEATURE_READ',
        description: 'View feature hierarchy',
        icon: 'list',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'FEATURE_UPDATE',
        description: 'Update feature details',
        icon: 'edit-3',
        sortOrder: 3,
      },
      {
        name: 'Update Status',
        code: 'FEATURE_UPDATE_STATUS',
        description: 'Enable/disable features',
        icon: 'toggle-left',
        sortOrder: 4,
      },
      {
        name: 'Assign',
        code: 'FEATURE_ASSIGN',
        description: 'Assign features to users in organizations',
        icon: 'user-check',
        sortOrder: 5,
      },
    ],
  },
  {
    name: 'Category Management',
    code: 'CATEGORY',
    description: 'Manage product categories',
    icon: 'folder-tree',
    sortOrder: 5,
    children: [
      {
        name: 'Create',
        code: 'CATEGORY_CREATE',
        description: 'Create new product categories',
        icon: 'folder-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'CATEGORY_READ',
        description: 'View category hierarchy',
        icon: 'folder-open',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'CATEGORY_UPDATE',
        description: 'Update category details',
        icon: 'folder-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'CATEGORY_DELETE',
        description: 'Delete categories',
        icon: 'folder-minus',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Brand Management',
    code: 'BRAND',
    description: 'Manage product brands',
    icon: 'tag',
    sortOrder: 6,
    children: [
      {
        name: 'Create',
        code: 'BRAND_CREATE',
        description: 'Create new product brands',
        icon: 'tag-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'BRAND_READ',
        description: 'View brand list',
        icon: 'tags',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'BRAND_UPDATE',
        description: 'Update brand details',
        icon: 'tag-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'BRAND_DELETE',
        description: 'Delete brands',
        icon: 'tag-minus',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Form Schema Management',
    code: 'FORM_SCHEMA',
    description: 'Manage dynamic form schemas',
    icon: 'form-input',
    sortOrder: 7,
    children: [
      {
        name: 'Create',
        code: 'FORM_SCHEMA_CREATE',
        description: 'Create new form schemas',
        icon: 'file-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'FORM_SCHEMA_READ',
        description: 'View form schema list',
        icon: 'file-text',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'FORM_SCHEMA_UPDATE',
        description: 'Update form schema configuration',
        icon: 'file-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'FORM_SCHEMA_DELETE',
        description: 'Delete form schemas',
        icon: 'file-minus',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Form Data Management',
    code: 'FORM_DATA',
    description: 'Manage form submissions',
    icon: 'clipboard-list',
    sortOrder: 8,
    children: [
      {
        name: 'Create',
        code: 'FORM_DATA_CREATE',
        description: 'Submit new form data',
        icon: 'clipboard-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'FORM_DATA_READ',
        description: 'View submitted form data',
        icon: 'clipboard-check',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'FORM_DATA_UPDATE',
        description: 'Update submitted form data',
        icon: 'clipboard-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'FORM_DATA_DELETE',
        description: 'Delete form submissions',
        icon: 'clipboard-x',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Warranty Template Management',
    code: 'WARRANTY_TEMPLATE',
    description: 'Manage warranty templates and rules',
    icon: 'shield-check',
    sortOrder: 9,
    children: [
      {
        name: 'Create',
        code: 'WARRANTY_TEMPLATE_CREATE',
        description: 'Create new warranty templates',
        icon: 'shield-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'WARRANTY_TEMPLATE_READ',
        description: 'View warranty template list',
        icon: 'shield',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'WARRANTY_TEMPLATE_UPDATE',
        description: 'Update warranty template rules',
        icon: 'shield-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'WARRANTY_TEMPLATE_DELETE',
        description: 'Delete warranty templates',
        icon: 'shield-off',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Registration Management',
    code: 'REGISTRATION',
    description: 'Manage product registrations',
    icon: 'clipboard-list',
    sortOrder: 10,
    children: [
      {
        name: 'Create',
        code: 'REGISTRATION_CREATE',
        description: 'Register new products',
        icon: 'plus-square',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'REGISTRATION_READ',
        description: 'View registration list',
        icon: 'list',
        sortOrder: 2,
      },
      {
        name: 'Read Own',
        code: 'REGISTRATION_READ_OWN',
        description: 'View own product registrations',
        icon: 'user',
        sortOrder: 3,
      },
    ],
  },
  {
    name: 'Warranty Management',
    code: 'WARRANTY',
    description: 'Manage warranties and claims',
    icon: 'award',
    sortOrder: 11,
    children: [
      {
        name: 'Read',
        code: 'WARRANTY_READ',
        description: 'View warranty list',
        icon: 'award',
        sortOrder: 1,
      },
      {
        name: 'Read Own',
        code: 'WARRANTY_READ_OWN',
        description: 'View own warranties',
        icon: 'user-check',
        sortOrder: 2,
      },
    ],
  },
  {
    name: 'Claims Management',
    code: 'CLAIM',
    description: 'Manage warranty claims',
    icon: 'file-warning',
    sortOrder: 12,
    children: [
      {
        name: 'Create',
        code: 'CLAIM_CREATE',
        description: 'Initiate new warranty claims',
        icon: 'alert-circle',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'CLAIM_READ',
        description: 'View claims list',
        icon: 'file-search',
        sortOrder: 2,
      },
      {
        name: 'Update Status',
        code: 'CLAIM_UPDATE_STATUS',
        description: 'Update claim workflow status',
        icon: 'refresh-cw',
        sortOrder: 3,
      },
    ],
  },
  {
    name: 'Dealer Type Management',
    code: 'DEALER_TYPE',
    description: 'Manage dealer types and roles',
    icon: 'id-card',
    sortOrder: 13,
    children: [
      {
        name: 'Create',
        code: 'DEALER_TYPE_CREATE',
        description: 'Create new dealer types',
        icon: 'id-card-plus',
        sortOrder: 1,
      },
      {
        name: 'Read',
        code: 'DEALER_TYPE_READ',
        description: 'View dealer type list',
        icon: 'id-card',
        sortOrder: 2,
      },
      {
        name: 'Update',
        code: 'DEALER_TYPE_UPDATE',
        description: 'Update dealer type configuration',
        icon: 'id-card-edit',
        sortOrder: 3,
      },
      {
        name: 'Delete',
        code: 'DEALER_TYPE_DELETE',
        description: 'Delete dealer types',
        icon: 'id-card-minus',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'File Management',
    code: 'FILE',
    description: 'Manage file uploads and storage',
    icon: 'file',
    sortOrder: 14,
    children: [
      {
        name: 'Create',
        code: 'FILE_CREATE',
        description: 'Upload files to storage',
        icon: 'upload',
        sortOrder: 1,
      },
      {
        name: 'Delete',
        code: 'FILE_DELETE',
        description: 'Delete files from storage',
        icon: 'trash-2',
        sortOrder: 2,
      },
    ],
  },
];

async function createFeatureTree(
  prisma: PrismaClient,
  features: any[],
  adminUserId: string,
  parentId: string | null = null,
): Promise<number> {
  let count = 0;
  for (const f of features) {
    try {
      const { children, ...rest } = f;
      await prisma.feature.create({
        data: {
          ...rest,
          parentId,
          status: 'ENABLED',
          createdBy: adminUserId,
          updatedBy: adminUserId,
        },
      });
      count++;
      if (children)
        count += await createFeatureTree(
          prisma,
          children,
          adminUserId,
          (await prisma.feature.findFirst({ where: { code: rest.code } }))!.id,
        );
    } catch (e: any) {
      /* skip */
    }
  }
  return count;
}

export async function seedFeatures(prisma: PrismaClient, adminUserId: string) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  🔑 Step 3/8: Seeding Features               │');
  console.log('└─────────────────────────────────────────────┘\n');

  await prisma.featureAccess.deleteMany();
  await prisma.feature.deleteMany();

  const total = await createFeatureTree(prisma, featureHierarchy, adminUserId);
  console.log(`   ✅ ${total} features created (14 modules + actions)\n`);
  return total;
}
