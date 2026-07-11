import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './user.seed';

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

function printDivider(title: string) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}\n`);
}

async function main() {
  console.clear();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     🚀 Warranty Management System - Seed             ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await clearDatabase();

  const admin = await seedUsers(prisma);

  printDivider('📊 SEED COMPLETE');
  console.log(`  Administrator:  ${admin.fullName}`);
  console.log(`  Email:          ${admin.email}`);
  console.log(`  Phone:          ${admin.phoneNumber}`);
  console.log(`  Role:           ${admin.role}`);
  console.log(`  ID:             ${admin.id}\n`);

  printDivider('🔑 LOGIN CREDENTIALS');
  console.log(`  Email:     ${admin.email}`);
  console.log(`  Password:  Admin@123\n`);

  console.log(`${'═'.repeat(60)}`);
  console.log('  ✅ Database seeded successfully!');
  console.log(`${'═'.repeat(60)}\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
