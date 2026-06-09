// apps/server/prisma/seed/seed.ts
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

const prisma = new PrismaClient({
  adapter,
} as any);

async function clearDatabase() {
  console.log('🧹 Clearing all tables...\n');

  // Delete in correct order to respect foreign key constraints
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

  console.log('✅ All tables cleared!\n');
}

async function main() {
  console.log('🌱 Starting seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Clear all existing data
  await clearDatabase();

  // Seed admin user
  await seedUsers(prisma);

  // Add more seed functions here as needed:
  // await seedFeatures(prisma, adminUser.id);
  // await seedOrganizations(prisma, adminUser.id);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ All seeds completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('\n❌ Seed failed:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
