// apps/server/prisma/seed/organization.seed.ts
import { PrismaClient } from '../../generated/prisma/client';

const organizationPrefixes = [
  'Prime',
  'Elite',
  'United',
  'Superior',
  'Advanced',
  'Premier',
  'Ultimate',
  'Dynamic',
  'Innovative',
  'Strategic',
  'Global',
  'NextGen',
  'Alpha',
  'Omega',
  'Vertex',
  'Apex',
  'Horizon',
  'Pinnacle',
  'Nova',
  'Titan',
];

const organizationSuffixes = [
  'Technologies',
  'Solutions',
  'Industries',
  'Enterprises',
  'Systems',
  'Holdings',
  'Group',
  'International',
  'Corporation',
  'Ventures',
  'Labs',
  'Networks',
  'Partners',
  'Associates',
  'Alliance',
];

function generateOrganization(index: number) {
  const prefix = organizationPrefixes[index % organizationPrefixes.length];
  const suffix = organizationSuffixes[index % organizationSuffixes.length];
  const name = `${prefix} ${suffix}`;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const companyName = `${name} Pvt Ltd.`;

  return { name, companyName, slug };
}

export async function seedOrganizations(
  prisma: PrismaClient,
  adminUserId: string,
  count: number = 5,
  clearExisting: boolean = false,
) {
  console.log('🌱 Seeding Organizations...');

  // Optionally clear existing organizations
  if (clearExisting) {
    await prisma.organization.deleteMany();
    console.log('🧹 Cleared existing organizations');
  }

  // Check existing count
  const existingCount = await prisma.organization.count();

  if (existingCount > 0 && !clearExisting) {
    console.log(
      `⚠️  ${existingCount} organizations already exist. Use clearExisting=true to reset.`,
    );
    return;
  }

  let createdCount = 0;

  for (let i = 0; i < count; i++) {
    const orgData = generateOrganization(i);

    // Check if slug already exists, if so append number
    let slug = orgData.slug;
    let existingSlug = await prisma.organization.findUnique({
      where: { slug },
    });
    let retryCount = 1;

    while (existingSlug) {
      slug = `${orgData.slug}-${retryCount}`;
      existingSlug = await prisma.organization.findUnique({ where: { slug } });
      retryCount++;
    }

    const org = await prisma.organization.create({
      data: {
        name: orgData.name,
        companyName: orgData.companyName,
        slug: slug,
        type: 'ROOT',
        isActive: true,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      },
    });

    createdCount++;
    console.log(`  ✅ [${createdCount}] ${org.name} (${org.slug})`);
  }

  console.log(`\n✅ Created ${createdCount} organizations!\n`);
}
