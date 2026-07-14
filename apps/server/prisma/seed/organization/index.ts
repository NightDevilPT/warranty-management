import { PrismaClient } from '../../../generated/prisma/client';
import { seedLogger } from '../utils/logger';

export async function seedOrganizations(
  prisma: PrismaClient,
  createdBy: string,
) {
  seedLogger.info('🏢 Seeding root organizations...');

  const organizations = [
    {
      name: 'TechServe India',
      companyName: 'TechServe India Private Limited',
      slug: 'techserve',
      type: 'ROOT' as const,
      hash: 'tech01',
      isActive: true,
    },
    {
      name: 'Global Electronics',
      companyName: 'Global Electronics Corporation',
      slug: 'globalelec',
      type: 'ROOT' as const,
      hash: 'global01',
      isActive: true,
    },
    {
      name: 'MegaMart Retail',
      companyName: 'MegaMart Retail Solutions Ltd',
      slug: 'megamart',
      type: 'ROOT' as const,
      hash: 'mega01',
      isActive: true,
    },
    {
      name: 'AutoParts Pro',
      companyName: 'AutoParts Pro Manufacturing Co',
      slug: 'autoparts',
      type: 'ROOT' as const,
      hash: 'auto01',
      isActive: true,
    },
    {
      name: 'HomeStyle Living',
      companyName: 'HomeStyle Living Products Inc',
      slug: 'homestyle',
      type: 'ROOT' as const,
      hash: 'home01',
      isActive: true,
    },
    {
      name: 'HealthFirst Medical',
      companyName: 'HealthFirst Medical Devices Ltd',
      slug: 'healthfirst',
      type: 'ROOT' as const,
      hash: 'health01',
      isActive: true,
    },
    {
      name: 'SportZone Equipment',
      companyName: 'SportZone Equipment International',
      slug: 'sportzone',
      type: 'ROOT' as const,
      hash: 'sport01',
      isActive: true,
    },
    {
      name: 'FreshFoods Organic',
      companyName: 'FreshFoods Organic Supplies Pvt Ltd',
      slug: 'freshfoods',
      type: 'ROOT' as const,
      hash: 'fresh01',
      isActive: true,
    },
    {
      name: 'BuildRight Tools',
      companyName: 'BuildRight Tools & Hardware Co',
      slug: 'buildright',
      type: 'ROOT' as const,
      hash: 'build01',
      isActive: true,
    },
    {
      name: 'KidsWorld Toys',
      companyName: 'KidsWorld Toys & Entertainment Ltd',
      slug: 'kidsworld',
      type: 'ROOT' as const,
      hash: 'kids01',
      isActive: true,
    },
    {
      name: 'PetCare Plus',
      companyName: 'PetCare Plus Products International',
      slug: 'petcare',
      type: 'ROOT' as const,
      hash: 'pet01',
      isActive: true,
    },
    {
      name: 'OfficePro Supplies',
      companyName: 'OfficePro Supplies & Stationery Ltd',
      slug: 'officepro',
      type: 'ROOT' as const,
      hash: 'office01',
      isActive: true,
    },
    {
      name: 'GardenGlow Nursery',
      companyName: 'GardenGlow Nursery & Landscaping Co',
      slug: 'gardenglow',
      type: 'ROOT' as const,
      hash: 'garden01',
      isActive: true,
    },
    {
      name: 'TechWear Fashion',
      companyName: 'TechWear Fashion & Apparel Pvt Ltd',
      slug: 'techwear',
      type: 'ROOT' as const,
      hash: 'wear01',
      isActive: true,
    },
    {
      name: 'SafeHome Security',
      companyName: 'SafeHome Security Systems Inc',
      slug: 'safehome',
      type: 'ROOT' as const,
      hash: 'safe01',
      isActive: true,
    },
    {
      name: 'EcoPower Energy',
      companyName: 'EcoPower Energy Solutions Ltd',
      slug: 'ecopower',
      type: 'ROOT' as const,
      hash: 'eco01',
      isActive: true,
    },
    {
      name: 'LuxuryTime Watches',
      companyName: 'LuxuryTime Watches & Accessories Co',
      slug: 'luxurytime',
      type: 'ROOT' as const,
      hash: 'luxury01',
      isActive: true,
    },
    {
      name: 'MusicBeat Audio',
      companyName: 'MusicBeat Audio Equipment Pvt Ltd',
      slug: 'musicbeat',
      type: 'ROOT' as const,
      hash: 'music01',
      isActive: true,
    },
    {
      name: 'KitchenMaster Appliances',
      companyName: 'KitchenMaster Appliances International',
      slug: 'kitchenmaster',
      type: 'ROOT' as const,
      hash: 'kitchen01',
      isActive: true,
    },
  ];

  const createdOrgs: Awaited<ReturnType<typeof prisma.organization.create>>[] =
    [];

  for (const org of organizations) {
    const created = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: {
        createdBy,
        updatedBy: createdBy,
      },
      create: {
        ...org,
        createdBy,
        updatedBy: createdBy,
      },
    });

    createdOrgs.push(created);
    seedLogger.info(
      `  ✅ ${created.name.padEnd(30)} ${created.slug.padEnd(18)} Hash: ${created.hash}`,
    );
  }

  seedLogger.info(
    `\n📊 Total root organizations seeded: ${createdOrgs.length}`,
  );

  return createdOrgs;
}
