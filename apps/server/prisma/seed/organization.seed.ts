import { PrismaClient } from '../../generated/prisma/client';

/**
 * Random word pools for generating realistic company names
 */
const adjectives = [
  'Global',
  'Prime',
  'Elite',
  'Alpha',
  'Omega',
  'Mega',
  'Ultra',
  'Cyber',
  'Digital',
  'Smart',
  'Tech',
  'Future',
  'Modern',
  'Advanced',
  'Dynamic',
  'Innovative',
  'Strategic',
  'Universal',
  'Pacific',
  'Atlantic',
  'Northern',
  'Southern',
  'Eastern',
  'Western',
  'Central',
  'Metro',
  'Royal',
  'Crown',
  'Star',
  'Sunrise',
  'Sunset',
  'Golden',
  'Silver',
  'Platinum',
  'Diamond',
  'Crystal',
  'Quantum',
  'Nova',
  'Apex',
  'Vertex',
  'Horizon',
  'Zenith',
];

const industries = [
  'Electronics',
  'Technologies',
  'Solutions',
  'Systems',
  'Industries',
  'Enterprises',
  'Corporation',
  'Manufacturing',
  'Services',
  'Networks',
  'Devices',
  'Appliances',
  'Components',
  'Circuits',
  'Hardware',
  'Software',
  'Automation',
  'Robotics',
  'Telecom',
  'Semiconductor',
  'Instruments',
  'Energy',
  'Healthcare',
  'Security',
  'Logistics',
];

const suffixes = [
  'Pvt Ltd',
  'Private Limited',
  'Limited',
  'LLP',
  'Corp',
  'Enterprises',
  'Group',
  'Holdings',
  'International',
];

const cities = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Noida',
  'Gurgaon',
  'Chandigarh',
  'Indore',
  'Bhopal',
  'Nagpur',
  'Surat',
  'Kochi',
  'Coimbatore',
  'Visakhapatnam',
  'Goa',
  'Mysore',
  'Mangalore',
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array
 */
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick N random unique elements from an array
 */
function pickRandomUnique<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random company name
 */
function generateCompanyName(): string {
  const patterns = [
    // Pattern 1: Adjective + Industry (e.g., "Global Technologies")
    () => `${pickRandom(adjectives)} ${pickRandom(industries)}`,
    // Pattern 2: Adjective + Industry + City (e.g., "Prime Electronics Mumbai")
    () =>
      `${pickRandom(adjectives)} ${pickRandom(industries)} ${pickRandom(cities)}`,
    // Pattern 3: City + Industry (e.g., "Bangalore Systems")
    () => `${pickRandom(cities)} ${pickRandom(industries)}`,
    // Pattern 4: Adjective + City + Industry (e.g., "Alpha Delhi Networks")
    () =>
      `${pickRandom(adjectives)} ${pickRandom(cities)} ${pickRandom(industries)}`,
  ];

  return pickRandom(patterns)();
}

/**
 * Generate a random legal company name
 */
function generateCompanyLegalName(displayName: string): string {
  return `${displayName} ${pickRandom(suffixes)}`;
}

/**
 * Generate URL-friendly slug from company name
 */
function generateSlug(name: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50); // Limit slug length

  return `${baseSlug}-${randomStr}-${timestamp}`;
}

/**
 * Generate a random organization type
 */
function generateOrgType(existingCount: number): 'ROOT' | 'BRANCH' {
  // If we have some organizations already, 30% chance of branch
  if (existingCount > 0 && Math.random() < 0.3) {
    return 'BRANCH';
  }
  return 'ROOT';
}

/**
 * Seed organizations with completely random data
 * @param prisma - Prisma client instance
 * @param count - Number of organizations to create
 * @param adminUserId - Admin user ID for createdBy/updatedBy
 * @returns Array of created organizations
 */
export async function seedOrganizations(
  prisma: PrismaClient,
  count: number = 10,
  adminUserId: string,
) {
  console.log(`🏢 Seeding ${count} random organizations...\n`);

  const createdOrganizations: any[] = [];
  const usedNames = new Set<string>();
  const usedSlugs = new Set<string>();

  // Create organizations in batches
  const batchSize = 5;
  for (let batchStart = 0; batchStart < count; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, count);
    const batchPromises: Promise<any>[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const index = i + 1;

      batchPromises.push(
        (async () => {
          try {
            // Generate unique name
            let name = generateCompanyName();
            let attempts = 0;
            while (usedNames.has(name) && attempts < 100) {
              name = generateCompanyName();
              attempts++;
            }
            usedNames.add(name);

            // Generate unique slug
            let slug = generateSlug(name);
            while (usedSlugs.has(slug)) {
              slug = generateSlug(name);
            }
            usedSlugs.add(slug);

            // Generate company legal name
            const companyName = generateCompanyLegalName(name);

            // Determine organization type
            const type = generateOrgType(createdOrganizations.length);

            // Handle branch organizations - assign random root as parent
            let rootId: string | undefined;
            let parentId: string | undefined;

            if (type === 'BRANCH' && createdOrganizations.length > 0) {
              const rootOrgs = createdOrganizations.filter(
                (org) => org.type === 'ROOT',
              );
              if (rootOrgs.length > 0) {
                const randomRoot = pickRandom(rootOrgs);
                rootId = randomRoot.id;
                parentId = randomRoot.id;
              }
            }

            // Randomly make 10% of organizations inactive
            const isActive = Math.random() > 0.1;

            const organization = await prisma.organization.create({
              data: {
                name,
                companyName,
                slug,
                type,
                isActive,
                rootId,
                parentId,
                createdBy: adminUserId,
                updatedBy: adminUserId,
              },
            });

            console.log(
              `  ✅ [${index}/${count}] ${organization.name} (${organization.type})${isActive ? '' : ' 🔴 INACTIVE'} - ${organization.slug}`,
            );

            return organization;
          } catch (error) {
            console.error(
              `  ❌ [${index}/${count}] Failed to create organization:`,
              error.message,
            );
            return null;
          }
        })(),
      );
    }

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    const successful = batchResults.filter((result) => result !== null);
    createdOrganizations.push(...successful);
  }

  const successCount = createdOrganizations.length;
  const failedCount = count - successCount;

  console.log(`\n✅ Successfully created ${successCount} organizations`);
  if (failedCount > 0) {
    console.log(`❌ Failed: ${failedCount} organizations`);
  }

  // Print summary
  const rootCount = createdOrganizations.filter(
    (org) => org.type === 'ROOT',
  ).length;
  const branchCount = createdOrganizations.filter(
    (org) => org.type === 'BRANCH',
  ).length;
  const activeCount = createdOrganizations.filter((org) => org.isActive).length;
  const inactiveCount = createdOrganizations.filter(
    (org) => !org.isActive,
  ).length;

  console.log(`\n📊 Summary:`);
  console.log(`   - ROOT organizations: ${rootCount}`);
  console.log(`   - BRANCH organizations: ${branchCount}`);
  console.log(`   - Active: ${activeCount}`);
  console.log(`   - Inactive: ${inactiveCount}`);
  console.log(`   - Total: ${successCount}\n`);

  return createdOrganizations;
}

/**
 * Create a single random organization
 */
export async function createRandomOrganization(
  prisma: PrismaClient,
  adminUserId: string,
) {
  const results = await seedOrganizations(prisma, 1, adminUserId);
  return results[0];
}
