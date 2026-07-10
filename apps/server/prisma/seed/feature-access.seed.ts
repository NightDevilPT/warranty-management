import { PrismaClient } from '../../generated/prisma/client';

const dealerTypeFeatureMap: Record<string, string[]> = {
  'Super Admin': [
    'DASHBOARD_READ',
    'DASHBOARD_READ_REPORTS',
    'ORGANIZATION_CREATE',
    'ORGANIZATION_READ',
    'ORGANIZATION_UPDATE',
    'ORGANIZATION_DELETE',
    'ORGANIZATION_MANAGE_BRANCHES',
    'USER_CREATE',
    'USER_READ',
    'USER_UPDATE',
    'USER_DELETE',
    'USER_ASSIGN_FEATURES',
    'FEATURE_CREATE',
    'FEATURE_READ',
    'FEATURE_UPDATE',
    'FEATURE_UPDATE_STATUS',
    'FEATURE_ASSIGN',
    'CATEGORY_CREATE',
    'CATEGORY_READ',
    'CATEGORY_UPDATE',
    'CATEGORY_DELETE',
    'BRAND_CREATE',
    'BRAND_READ',
    'BRAND_UPDATE',
    'BRAND_DELETE',
    'DEALER_TYPE_CREATE',
    'DEALER_TYPE_READ',
    'DEALER_TYPE_UPDATE',
    'DEALER_TYPE_DELETE',
    'FILE_CREATE',
    'FILE_DELETE',
    'FORM_SCHEMA_CREATE',
    'FORM_SCHEMA_READ',
    'FORM_SCHEMA_UPDATE',
    'FORM_SCHEMA_DELETE',
    'FORM_DATA_CREATE',
    'FORM_DATA_READ',
    'FORM_DATA_UPDATE',
    'FORM_DATA_DELETE',
    'WARRANTY_TEMPLATE_CREATE',
    'WARRANTY_TEMPLATE_READ',
    'WARRANTY_TEMPLATE_UPDATE',
    'WARRANTY_TEMPLATE_DELETE',
    'REGISTRATION_CREATE',
    'REGISTRATION_READ',
    'REGISTRATION_READ_OWN',
    'WARRANTY_READ',
    'WARRANTY_READ_OWN',
    'CLAIM_CREATE',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
  ],
  Manager: [
    'DASHBOARD_READ',
    'DASHBOARD_READ_REPORTS',
    'ORGANIZATION_READ',
    'USER_READ',
    'USER_ASSIGN_FEATURES',
    'FEATURE_READ',
    'CATEGORY_READ',
    'BRAND_READ',
    'DEALER_TYPE_READ',
    'REGISTRATION_READ',
    'WARRANTY_READ',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
    'FORM_SCHEMA_READ',
    'FORM_DATA_READ',
  ],
  'Support Agent': [
    'DASHBOARD_READ',
    'REGISTRATION_CREATE',
    'REGISTRATION_READ',
    'WARRANTY_READ',
    'CLAIM_CREATE',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
    'FORM_DATA_CREATE',
    'FORM_DATA_READ',
  ],
  'Sales Representative': [
    'DASHBOARD_READ',
    'REGISTRATION_CREATE',
    'REGISTRATION_READ',
    'REGISTRATION_READ_OWN',
    'FORM_DATA_CREATE',
    'FORM_DATA_READ',
    'FILE_CREATE',
  ],
  Technician: [
    'DASHBOARD_READ',
    'WARRANTY_READ',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
    'FORM_DATA_READ',
    'FORM_DATA_UPDATE',
  ],
  Viewer: [
    'DASHBOARD_READ',
    'ORGANIZATION_READ',
    'USER_READ',
    'CATEGORY_READ',
    'BRAND_READ',
    'DEALER_TYPE_READ',
    'REGISTRATION_READ',
    'WARRANTY_READ',
    'CLAIM_READ',
    'FORM_SCHEMA_READ',
    'FORM_DATA_READ',
  ],
  'Authorized Dealer': [
    'DASHBOARD_READ',
    'REGISTRATION_CREATE',
    'REGISTRATION_READ',
    'REGISTRATION_READ_OWN',
    'WARRANTY_READ_OWN',
    'CLAIM_CREATE',
    'CLAIM_READ',
    'FORM_DATA_CREATE',
    'FORM_DATA_READ',
  ],
  'Service Center': [
    'DASHBOARD_READ',
    'WARRANTY_READ',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
    'FORM_DATA_READ',
    'FORM_DATA_UPDATE',
    'FILE_CREATE',
  ],
  Distributor: [
    'DASHBOARD_READ',
    'REGISTRATION_READ',
    'WARRANTY_READ',
    'FORM_DATA_READ',
  ],
  Retailer: [
    'DASHBOARD_READ',
    'REGISTRATION_CREATE',
    'REGISTRATION_READ_OWN',
    'WARRANTY_READ_OWN',
  ],
  Installer: ['DASHBOARD_READ', 'REGISTRATION_READ_OWN', 'FORM_DATA_CREATE'],
  Inspector: [
    'DASHBOARD_READ',
    'WARRANTY_READ',
    'CLAIM_READ',
    'CLAIM_UPDATE_STATUS',
    'FORM_DATA_READ',
  ],
};

export async function seedFeatureAccess(
  prisma: PrismaClient,
  adminUser: any,
  organizations: any[],
) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  🔐 Step 8/8: Seeding Feature Access         │');
  console.log('└─────────────────────────────────────────────┘\n');

  const allFeatures = await prisma.feature.findMany({
    select: { id: true, code: true },
  });
  const featureMap = new Map<string, string>();
  allFeatures.forEach((f) => featureMap.set(f.code, f.id));

  const allDealerTypes = await prisma.dealerType.findMany({
    include: { organization: { select: { name: true } } },
  });

  let totalCreated = 0;
  const processedOrgs = new Set<string>();

  for (const dt of allDealerTypes) {
    const dtName = dt.name;
    const featureCodes = dealerTypeFeatureMap[dtName];

    if (!featureCodes) continue;

    let assigned = 0;
    let skipped = 0;

    for (const code of featureCodes) {
      const featureId = featureMap.get(code);
      if (!featureId) {
        skipped++;
        continue;
      }

      try {
        // Use type assertion to bypass TypeScript error
        await (prisma as any).featureAccess.create({
          data: {
            orgId: dt.orgId,
            dealerTypeId: dt.id,
            featureId,
            isActive: true,
            enabledAt: new Date(),
            updatedBy: adminUser.id,
          },
        });
        assigned++;
      } catch (e: any) {
        skipped++;
      }
    }

    if (!processedOrgs.has(dt.orgId)) {
      processedOrgs.add(dt.orgId);
      const orgName = (dt as any).organization?.name || dt.orgId;
      console.log(`   🏢 ${orgName}`);
    }

    console.log(
      `      ✅ ${dtName.padEnd(24)} ${String(assigned).padStart(3)} features (${skipped} skipped)`,
    );
    totalCreated += assigned;
  }

  console.log(`\n   ✅ Total: ${totalCreated} feature access records\n`);
  return totalCreated;
}
