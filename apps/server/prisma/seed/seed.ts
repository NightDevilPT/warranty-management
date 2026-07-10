import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedUsers } from './user.seed';
import { seedOrganizations } from './organization.seed';
import { seedFeatures } from './feature.seed';
import { seedCategories } from './category.seed';
import { seedBrands } from './brand.seed';
import { seedDealerTypes } from './dealer-type.seed';
import { seedUserAccess } from './user-access.seed';
import { seedFeatureAccess } from './feature-access.seed';

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

function printTable(headers: string[], rows: string[][]) {
  const colWidths = headers.map(
    (h, i) => Math.max(h.length, ...rows.map((r) => (r[i] || '').length)) + 2,
  );
  const sep = '├' + colWidths.map((w) => '─'.repeat(w)).join('┼') + '┤';
  const top = '┌' + colWidths.map((w) => '─'.repeat(w)).join('┬') + '┐';
  const bottom = '└' + colWidths.map((w) => '─'.repeat(w)).join('┴') + '┘';

  console.log(top);
  console.log(
    '│' +
      headers.map((h, i) => ` ${h.padEnd(colWidths[i] - 1)}`).join('│') +
      '│',
  );
  console.log(sep);
  rows.forEach((r) =>
    console.log(
      '│' +
        r.map((c, i) => ` ${(c || '').padEnd(colWidths[i] - 1)}`).join('│') +
        '│',
    ),
  );
  console.log(bottom);
}

async function main() {
  console.clear();
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 Warranty Management System - Database Seed      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await clearDatabase();

  // Run all seeds
  const users = await seedUsers(prisma);
  const adminUser = users[0];
  const organizations = await seedOrganizations(prisma, 10, adminUser.id);
  const featureCount = await seedFeatures(prisma, adminUser.id);
  const categoryCount = await seedCategories(
    prisma,
    organizations,
    adminUser.id,
  );
  const brandCount = await seedBrands(prisma, organizations, adminUser.id, 20);
  const dealerTypeCount = await seedDealerTypes(
    prisma,
    organizations,
    adminUser.id,
  );
  const allDealerTypes = await prisma.dealerType.findMany();
  const userAccessCount = await seedUserAccess(
    prisma,
    adminUser,
    organizations,
    allDealerTypes,
  );
  const featureAccessCount = await seedFeatureAccess(
    prisma,
    adminUser,
    organizations,
  );

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  printDivider('📊 SEEDING COMPLETE - SUMMARY');

  console.log(`  👤 Users:              ${users.length}`);
  console.log(
    `  🏢 Organizations:      ${organizations.length} (${organizations.filter((o: any) => o.type === 'ROOT').length} ROOT, ${organizations.filter((o: any) => o.type === 'BRANCH').length} BRANCH)`,
  );
  console.log(`  🔑 Features:           ${featureCount}`);
  console.log(`  📁 Categories:         ${categoryCount}`);
  console.log(`  🏷️  Brands:             ${brandCount}`);
  console.log(`  👔 Dealer Types:       ${dealerTypeCount}`);
  console.log(`  👥 User Access:        ${userAccessCount}`);
  console.log(`  🔐 Feature Access:     ${featureAccessCount}`);

  // Organizations Table
  printDivider('🏢 ORGANIZATIONS');
  const orgRows = organizations.map((o: any, i: number) => [
    String(i + 1),
    o.name,
    o.type,
    o.isActive ? '🟢 Active' : '🔴 Inactive',
    o.slug,
    o.id.substring(0, 8) + '...',
  ]);
  printTable(['#', 'Name', 'Type', 'Status', 'Slug', 'ID'], orgRows);

  // Users Table
  printDivider('👤 USERS');
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
  });
  const userRows = allUsers.map((u: any, i: number) => [
    String(i + 1),
    u.fullName,
    u.email,
    u.role,
    u.id.substring(0, 8) + '...',
  ]);
  printTable(['#', 'Name', 'Email', 'Role', 'ID'], userRows);

  // Dealer Types Summary
  printDivider('👔 DEALER TYPES (per organization)');
  const dtSummary = organizations.map((o: any) => {
    const count = allDealerTypes.filter((dt: any) => dt.orgId === o.id).length;
    return [o.name, String(count), o.id.substring(0, 8) + '...'];
  });
  printTable(['Organization', 'Dealer Types', 'Org ID'], dtSummary);

  // User Access Summary
  printDivider('👥 USER ACCESS');
  const uaRecords = await prisma.userAccess.findMany({
    include: {
      user: { select: { email: true } },
      organization: { select: { name: true } },
      dealerType: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });
  const uaRows = uaRecords.map((ua: any, i: number) => [
    String(i + 1),
    ua.user.email,
    ua.organization.name,
    ua.role || '-',
    ua.dealerType?.name || '-',
  ]);
  printTable(
    ['#', 'User Email', 'Organization', 'Role', 'Dealer Type'],
    uaRows,
  );
  if (userAccessCount > 20)
    console.log(`  ... and ${userAccessCount - 20} more records`);

  // Login Credentials
  printDivider('🔑 LOGIN CREDENTIALS');
  console.log('  PLATFORM ADMIN:');
  console.log('    📧 pawankumartadagsingh@gmail.com');
  console.log('    🔐 Admin@123\n');
  console.log('  COMPANY ADMINS (Password: Staff@123):');
  console.log('    admin@techserve.com       → TechServe India');
  console.log('    admin@globalgadgets.com   → Global Gadgets');
  console.log('    admin@electrocare.com     → ElectroCare Solutions');
  console.log('    admin@smartlife.com       → SmartLife Electronics');
  console.log('    admin@primeappliances.com → Prime Appliances\n');
  console.log(
    '  STAFF (Password: Staff@123) | PARTNERS (Password: Partner@123):',
  );
  console.log('    raj.sharma@techserve.com      (Manager)');
  console.log('    priya.patel@techserve.com     (Support Agent)');
  console.log('    amit.verma@techserve.com      (Sales Rep)');
  console.log('    suresh.kumar@techserve.com    (Technician)');
  console.log('    neha.gupta@techserve.com      (Viewer)');
  console.log('    vikram.singh@globalgadgets.com (Manager)');
  console.log('    anjali.rao@globalgadgets.com   (Support Agent)');
  console.log('    deepak.nair@electrocare.com    (Manager)');
  console.log('    kavitha.menon@electrocare.com  (Technician)');
  console.log('    arun.joshi@smartlife.com       (Manager)');
  console.log('    meera.reddy@primeappliances.com (Support Agent)');
  console.log('    ramesh.patel@partner.com       (Authorized Dealer)');
  console.log('    thomas.jose@partner.com        (Service Center)');
  console.log('    arif.khan@partner.com          (Distributor)\n');

  console.log(`${'═'.repeat(60)}`);
  console.log('  ✅ All seeds completed successfully!');
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
