import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './user/index';
import { seedOrganizations } from './organization/index';
import { seedFeatures } from './features/index';
import { seedLogger } from './utils/logger';

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5433/warranty_system?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function clearDatabase() {
  process.stdout.write('🧹 Clearing database... ');

  await prisma.warranty.deleteMany();
  await prisma.warrantyTemplate.deleteMany();
  await prisma.formData.deleteMany();
  await prisma.formSchema.deleteMany();
  await prisma.featureAccess.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.userAccess.deleteMany();
  await prisma.dealerType.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✅ Done\n');
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     🚀 Warranty Management System - Seed             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await clearDatabase();

  // Step 1: Seed admin user first (creates system organization internally)
  const admin = await seedUsers(prisma);

  // Step 2: Seed remaining root organizations with admin as creator
  const organizations = await seedOrganizations(prisma, admin.userAccessId);

  // Step 3: Seed global features
  await seedFeatures(prisma);

  console.log(`${'═'.repeat(60)}`);
  console.log('  📊 SEED COMPLETE');
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Administrator:    ${admin.fullName}`);
  console.log(`  Email:            ${admin.email}`);
  console.log(`  Role:             ${admin.role}`);
  console.log(`  Portal Type:      ${admin.portalType}`);
  console.log(`  System Org Hash:  ${admin.organizationHash}`);
  console.log(`  Total Orgs:       ${organizations.length + 1}\n`);

  console.log(`${'═'.repeat(60)}`);
  console.log('  🏢 ORGANIZATIONS');
  console.log(`${'═'.repeat(60)}`);
  console.log(
    `  ${admin.organizationName.padEnd(30)} system${''.padEnd(15)} ${admin.organizationHash}`,
  );
  for (const org of organizations) {
    console.log(`  ${org.name.padEnd(30)} ${org.slug.padEnd(18)} ${org.hash}`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  🔑 LOGIN CREDENTIALS');
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Method:    OTP (Passwordless Login)`);
  console.log(`  Email:     ${admin.email}`);
  console.log(`  Password:  Admin@123`);
  console.log(`  Endpoint:  POST /api/auth/admin/send-otp\n`);

  console.log(`${'═'.repeat(60)}`);
  console.log('  ✅ Database seeded successfully!');
  console.log(`${'═'.repeat(60)}\n`);

  seedLogger.info('Database seed completed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    seedLogger.error('Seed failed', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
