import { PrismaClient } from '../../../generated/prisma/client';
import { seedLogger } from '../utils/logger';

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  children?: CategorySeed[];
}

const categorySeeds: CategorySeed[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
    children: [
      {
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Smartphones and feature phones',
      },
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Notebooks and portable computers',
      },
      {
        name: 'Tablets',
        slug: 'tablets',
        description: 'Tablet devices and iPads',
      },
      {
        name: 'Audio',
        slug: 'audio',
        description: 'Headphones, speakers, and audio equipment',
      },
    ],
  },
  {
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Household appliances and equipment',
    children: [
      {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Kitchen appliances and cookware',
      },
      {
        name: 'Laundry',
        slug: 'laundry',
        description: 'Washing machines and dryers',
      },
      {
        name: 'Climate Control',
        slug: 'climate-control',
        description: 'AC, heaters, and air purifiers',
      },
    ],
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment and fitness gear',
    children: [
      {
        name: 'Exercise Equipment',
        slug: 'exercise-equipment',
        description: 'Treadmills, bikes, and weights',
      },
      {
        name: 'Outdoor Sports',
        slug: 'outdoor-sports',
        description: 'Outdoor and team sports equipment',
      },
    ],
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health and beauty products',
    children: [
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Skincare products and treatments',
      },
      {
        name: 'Medical Devices',
        slug: 'medical-devices',
        description: 'Health monitoring devices',
      },
    ],
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Home and office furniture',
    children: [
      {
        name: 'Living Room',
        slug: 'living-room',
        description: 'Sofas, tables, and living room furniture',
      },
      {
        name: 'Bedroom',
        slug: 'bedroom',
        description: 'Beds, wardrobes, and bedroom furniture',
      },
      {
        name: 'Office',
        slug: 'office',
        description: 'Desks, chairs, and office furniture',
      },
    ],
  },
];

export async function seedCategories(
  prisma: PrismaClient,
  organizationIds: string[],
) {
  seedLogger.info('📁 Seeding categories...');

  let createdCount = 0;

  for (const orgId of organizationIds) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || org.slug === 'system') continue;

    const categoriesForOrg = categorySeeds.slice(
      0,
      3 + Math.floor(Math.random() * 2),
    );

    for (const category of categoriesForOrg) {
      const existing = await prisma.category.findFirst({
        where: { orgId, slug: category.slug, deletedAt: null },
      });

      if (!existing) {
        const created = await prisma.category.create({
          data: {
            orgId,
            name: category.name,
            slug: category.slug,
            description: category.description,
            isActive: true,
            sortOrder: 0,
          },
        });
        createdCount++;

        if (category.children) {
          for (let i = 0; i < category.children.length; i++) {
            const child = category.children[i];
            const childExisting = await prisma.category.findFirst({
              where: { orgId, slug: child.slug, deletedAt: null },
            });

            if (!childExisting) {
              await prisma.category.create({
                data: {
                  orgId,
                  name: child.name,
                  slug: child.slug,
                  description: child.description,
                  parentId: created.id,
                  isActive: true,
                  sortOrder: i + 1,
                },
              });
              createdCount++;
            }
          }
        }
      }
    }
  }

  seedLogger.info(`✅ Categories: ${createdCount} created`);
}
