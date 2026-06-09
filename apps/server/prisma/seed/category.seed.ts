import { PrismaClient } from '../../generated/prisma/client';

interface CategorySeedData {
  name: string;
  description: string;
  sortOrder: number;
  children?: CategorySeedData[];
}

/**
 * Category hierarchy for electronics and appliances
 */
const categoryHierarchy: CategorySeedData[] = [
  {
    name: 'Electronics',
    description: 'Consumer electronics and gadgets',
    sortOrder: 1,
    children: [
      {
        name: 'Mobile Phones',
        description: 'Smartphones and feature phones',
        sortOrder: 1,
        children: [
          {
            name: 'Smartphones',
            description: 'Android and iOS smartphones',
            sortOrder: 1,
          },
          {
            name: 'Feature Phones',
            description: 'Basic mobile phones',
            sortOrder: 2,
          },
          {
            name: 'Phone Accessories',
            description: 'Cases, chargers, screen protectors',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Laptops',
        description: 'Notebooks and laptops',
        sortOrder: 2,
        children: [
          {
            name: 'Gaming Laptops',
            description: 'High-performance gaming laptops',
            sortOrder: 1,
          },
          {
            name: 'Business Laptops',
            description: 'Professional and business laptops',
            sortOrder: 2,
          },
          {
            name: 'Ultrabooks',
            description: 'Thin and light laptops',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Tablets',
        description: 'Tablets and e-readers',
        sortOrder: 3,
        children: [
          {
            name: 'Android Tablets',
            description: 'Android-based tablets',
            sortOrder: 1,
          },
          { name: 'iPads', description: 'Apple iPad series', sortOrder: 2 },
          {
            name: 'E-Readers',
            description: 'Kindle and other e-readers',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Audio',
        description: 'Audio devices and accessories',
        sortOrder: 4,
        children: [
          {
            name: 'Headphones',
            description: 'Over-ear and on-ear headphones',
            sortOrder: 1,
          },
          {
            name: 'Earbuds',
            description: 'True wireless and wired earbuds',
            sortOrder: 2,
          },
          {
            name: 'Speakers',
            description: 'Bluetooth and wired speakers',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'Home Appliances',
    description: 'Home and kitchen appliances',
    sortOrder: 2,
    children: [
      {
        name: 'Kitchen Appliances',
        description: 'Kitchen and cooking appliances',
        sortOrder: 1,
        children: [
          {
            name: 'Microwave Ovens',
            description: 'Solo and convection microwaves',
            sortOrder: 1,
          },
          {
            name: 'Refrigerators',
            description: 'Single door, double door, side by side',
            sortOrder: 2,
          },
          {
            name: 'Mixer Grinders',
            description: 'Mixer grinders and juicers',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Washing Machines',
        description: 'Laundry appliances',
        sortOrder: 2,
        children: [
          {
            name: 'Front Load',
            description: 'Front loading washing machines',
            sortOrder: 1,
          },
          {
            name: 'Top Load',
            description: 'Top loading washing machines',
            sortOrder: 2,
          },
          {
            name: 'Semi Automatic',
            description: 'Semi-automatic washing machines',
            sortOrder: 3,
          },
        ],
      },
      {
        name: 'Air Conditioners',
        description: 'Cooling and air conditioning',
        sortOrder: 3,
        children: [
          {
            name: 'Split AC',
            description: 'Split air conditioners',
            sortOrder: 1,
          },
          {
            name: 'Window AC',
            description: 'Window air conditioners',
            sortOrder: 2,
          },
          {
            name: 'Inverter AC',
            description: 'Inverter technology ACs',
            sortOrder: 3,
          },
        ],
      },
    ],
  },
  {
    name: 'Computers & Accessories',
    description: 'Computer hardware and peripherals',
    sortOrder: 3,
    children: [
      {
        name: 'Desktop Computers',
        description: 'Desktop PCs and workstations',
        sortOrder: 1,
      },
      {
        name: 'Monitors',
        description: 'Computer monitors and displays',
        sortOrder: 2,
      },
      {
        name: 'Printers',
        description: 'Printers, scanners, and all-in-ones',
        sortOrder: 3,
      },
      {
        name: 'Networking',
        description: 'Routers, switches, and networking gear',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'TV & Entertainment',
    description: 'Televisions and entertainment devices',
    sortOrder: 4,
    children: [
      {
        name: 'Smart TVs',
        description: 'Smart and Android TVs',
        sortOrder: 1,
      },
      {
        name: 'LED TVs',
        description: 'LED television sets',
        sortOrder: 2,
      },
      {
        name: 'Streaming Devices',
        description: 'Fire Stick, Chromecast, etc.',
        sortOrder: 3,
      },
      {
        name: 'Gaming Consoles',
        description: 'PlayStation, Xbox, Nintendo',
        sortOrder: 4,
      },
    ],
  },
  {
    name: 'Cameras',
    description: 'Digital cameras and photography gear',
    sortOrder: 5,
    children: [
      {
        name: 'DSLR',
        description: 'Digital SLR cameras',
        sortOrder: 1,
      },
      {
        name: 'Mirrorless',
        description: 'Mirrorless cameras',
        sortOrder: 2,
      },
      {
        name: 'Action Cameras',
        description: 'GoPro and action cameras',
        sortOrder: 3,
      },
      {
        name: 'Camera Accessories',
        description: 'Lenses, tripods, memory cards',
        sortOrder: 4,
      },
    ],
  },
];

/**
 * Recursively create categories with their children
 */
async function createCategoryTree(
  prisma: PrismaClient,
  categories: CategorySeedData[],
  orgId: string,
  adminUserId: string,
  parentId: string | null = null,
  depth: number = 0,
): Promise<number> {
  let count = 0;
  const indent = '  '.repeat(depth);

  for (const categoryData of categories) {
    try {
      const { children, ...categoryWithoutChildren } = categoryData;
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const category = await prisma.category.create({
        data: {
          ...categoryWithoutChildren,
          slug,
          orgId,
          parentId,
          createdBy: adminUserId,
          updatedBy: adminUserId,
        },
      });

      console.log(`${indent}✅ ${category.name} (${category.slug})`);
      count++;

      // Create children recursively
      if (children && children.length > 0) {
        count += await createCategoryTree(
          prisma,
          children,
          orgId,
          adminUserId,
          category.id,
          depth + 1,
        );
      }
    } catch (error) {
      console.error(
        `${indent}❌ Failed to create ${categoryData.name}: ${error.message}`,
      );
    }
  }

  return count;
}

/**
 * Seed categories for multiple organizations
 * @param prisma - Prisma client instance
 * @param organizations - Array of organizations to create categories for
 * @param adminUserId - Admin user ID
 */
export async function seedCategories(
  prisma: PrismaClient,
  organizations: any[],
  adminUserId: string,
) {
  console.log('📁 Seeding Categories...\n');

  let totalCreated = 0;

  for (const org of organizations) {
    console.log(`🏢 Creating categories for: ${org.name} (${org.id})\n`);

    const created = await createCategoryTree(
      prisma,
      categoryHierarchy,
      org.id,
      adminUserId,
    );
    totalCreated += created;

    console.log(`   ✅ Created ${created} categories for ${org.name}\n`);
  }

  console.log(`✅ Total categories created: ${totalCreated}\n`);
  return totalCreated;
}
