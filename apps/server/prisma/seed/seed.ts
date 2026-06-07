// apps/server/prisma/seed/seed.ts
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './user.seed';
import { seedOrganizations } from './organization.seed';

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

  await prisma.warranty.deleteMany();
  await prisma.warrantyTemplate.deleteMany();
  await prisma.formData.deleteMany();
  await prisma.formSchema.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.dealerPersona.deleteMany();
  await prisma.dealerTypePersona.deleteMany();
  await prisma.organizationPersona.deleteMany();
  await prisma.dealerType.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.userAccess.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('✅ All tables cleared!\n');
}

async function main() {
  console.log('🌱 Starting seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Clear all existing data
  await clearDatabase();

  // Seed admin user first (returns admin user for ID)
  const adminUser = await seedUsers(prisma);

  // Seed organizations with admin user ID as creator
  await seedOrganizations(prisma, adminUser.id, 20);

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
