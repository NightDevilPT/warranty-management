import { PrismaClient } from '../../../generated/prisma/client';
import { seedLogger } from '../utils/logger';

interface DealerTypeSeed {
  name: string;
  partnerType: 'INTERNAL' | 'EXTERNAL';
  description: string;
}

const dealerTypeSeeds: DealerTypeSeed[] = [
  {
    name: 'Support Agent',
    partnerType: 'INTERNAL',
    description: 'Customer support and service agents',
  },
  {
    name: 'Warranty Manager',
    partnerType: 'INTERNAL',
    description: 'Manages warranty claims and approvals',
  },
  {
    name: 'Store Manager',
    partnerType: 'INTERNAL',
    description: 'Retail store management',
  },
  {
    name: 'Sales Representative',
    partnerType: 'INTERNAL',
    description: 'Sales team members',
  },
  {
    name: 'Dealer',
    partnerType: 'EXTERNAL',
    description: 'Authorized dealers and distributors',
  },
  {
    name: 'Retailer',
    partnerType: 'EXTERNAL',
    description: 'Retail store partners',
  },
  {
    name: 'Installer',
    partnerType: 'EXTERNAL',
    description: 'Product installation partners',
  },
  {
    name: 'Repair Center',
    partnerType: 'EXTERNAL',
    description: 'Authorized repair and service centers',
  },
];

export async function seedDealerTypes(
  prisma: PrismaClient,
  organizationIds: string[],
) {
  seedLogger.info('👥 Seeding dealer types...');

  let createdCount = 0;

  for (const orgId of organizationIds) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org || org.slug === 'system') continue;

    const typesForOrg = dealerTypeSeeds.slice(
      0,
      4 + Math.floor(Math.random() * 4),
    );

    for (const dt of typesForOrg) {
      const existing = await prisma.dealerType.findFirst({
        where: { orgId, name: dt.name, deletedAt: null },
      });

      if (!existing) {
        await prisma.dealerType.create({
          data: {
            orgId,
            name: dt.name,
            partnerType: dt.partnerType,
            description: dt.description,
            isActive: true,
          },
        });
        createdCount++;
      }
    }
  }

  seedLogger.info(`✅ Dealer Types: ${createdCount} created`);
}
