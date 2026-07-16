import { PrismaClient } from '../../../generated/prisma/client';
import { seedLogger } from '../utils/logger';

interface BrandSeed {
  name: string;
  slug: string;
  description: string;
  website?: string;
}

const brandSeeds: BrandSeed[] = [
  {
    name: 'Samsung',
    slug: 'samsung',
    description: 'Samsung Electronics',
    website: 'https://samsung.com',
  },
  {
    name: 'Apple',
    slug: 'apple',
    description: 'Apple Inc.',
    website: 'https://apple.com',
  },
  {
    name: 'Sony',
    slug: 'sony',
    description: 'Sony Corporation',
    website: 'https://sony.com',
  },
  {
    name: 'LG',
    slug: 'lg',
    description: 'LG Electronics',
    website: 'https://lg.com',
  },
  {
    name: 'Panasonic',
    slug: 'panasonic',
    description: 'Panasonic Corporation',
    website: 'https://panasonic.com',
  },
  {
    name: 'Philips',
    slug: 'philips',
    description: 'Philips Electronics',
    website: 'https://philips.com',
  },
  {
    name: 'Bosch',
    slug: 'bosch',
    description: 'Bosch Home Appliances',
    website: 'https://bosch.com',
  },
  {
    name: 'Whirlpool',
    slug: 'whirlpool',
    description: 'Whirlpool Corporation',
    website: 'https://whirlpool.com',
  },
  {
    name: 'Dell',
    slug: 'dell',
    description: 'Dell Technologies',
    website: 'https://dell.com',
  },
  { name: 'HP', slug: 'hp', description: 'HP Inc.', website: 'https://hp.com' },
];

export async function seedBrands(
  prisma: PrismaClient,
  organizationIds: string[],
) {
  seedLogger.info('🏷️ Seeding brands...');

  let createdCount = 0;

  for (const orgId of organizationIds) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || org.slug === 'system') continue;

    const brandsForOrg = brandSeeds.slice(0, 3 + Math.floor(Math.random() * 5));

    for (const brand of brandsForOrg) {
      const existing = await prisma.brand.findFirst({
        where: { orgId, slug: brand.slug, deletedAt: null },
      });

      if (!existing) {
        await prisma.brand.create({
          data: {
            orgId,
            name: brand.name,
            slug: brand.slug,
            description: brand.description,
            website: brand.website,
            isActive: true,
          },
        });
        createdCount++;
      }
    }
  }

  seedLogger.info(`✅ Brands: ${createdCount} created`);
}
