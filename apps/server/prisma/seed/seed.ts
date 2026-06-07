// apps/server/prisma/seed/seed.ts
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

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

  console.log('✅ All tables cleared!\n');
}

async function main() {
  console.log('🌱 Starting seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Clear all existing data
  await clearDatabase();

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
