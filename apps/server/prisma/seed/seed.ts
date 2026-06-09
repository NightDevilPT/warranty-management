import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './user.seed';
import { seedOrganizations } from './organization.seed';
import { seedFeatures } from './feature.seed';
import { seedCategories } from './category.seed';
import { seedBrands } from './brand.seed';

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
  console.log('🌱 Starting Warranty Management System seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Clear all existing data
  await clearDatabase();

  // 1. Seed Users
  console.log('👤 Step 1: Seeding Users...\n');
  const users = await seedUsers(prisma);
  const adminUser = users[0];

  if (!adminUser || adminUser.role !== 'ADMIN') {
    throw new Error('Admin user not found after seeding.');
  }
  console.log(`✅ Admin ready: ${adminUser.email}\n`);

  // 2. Seed Organizations
  console.log('🏢 Step 2: Seeding Organizations...\n');
  const organizations = await seedOrganizations(prisma, 10, adminUser.id);
  console.log(`✅ Created ${organizations.length} organizations\n`);

  // 3. Seed Features
  console.log('🔑 Step 3: Seeding Features...\n');
  const featureCount = await seedFeatures(prisma, adminUser.id);
  console.log(`✅ Created ${featureCount} features\n`);

  // 4. Seed Categories for all organizations
  console.log('📁 Step 4: Seeding Categories...\n');
  const categoryCount = await seedCategories(
    prisma,
    organizations,
    adminUser.id,
  );

  // 5. Seed Brands for all organizations
  console.log('🏷️  Step 5: Seeding Brands...\n');
  const brandCount = await seedBrands(prisma, organizations, adminUser.id, 20);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 Final Seeding Summary:');
  console.log(`   👤 Users: ${users.length}`);
  console.log(`   🏢 Organizations: ${organizations.length}`);
  console.log(`   🔑 Features: ${featureCount}`);
  console.log(
    `   📁 Categories: ${typeof categoryCount === 'number' ? categoryCount : 'N/A'}`,
  );
  console.log(
    `   🏷️  Brands: ${typeof brandCount === 'number' ? brandCount : 'N/A'}`,
  );
  console.log('\n✅ All seeds completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Database connections closed.');
  })
  .catch(async (e) => {
    console.error('\n❌ Seed failed with error:');
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
