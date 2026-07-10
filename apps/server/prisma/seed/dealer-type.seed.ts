import { PrismaClient } from '../../generated/prisma/client';

const dealerTypeTemplates = [
  {
    name: 'Super Admin',
    partnerType: 'INTERNAL',
    description:
      'Organization super administrator with full access to all features',
  },
  {
    name: 'Manager',
    partnerType: 'INTERNAL',
    description:
      'Department manager with access to manage team and view reports',
  },
  {
    name: 'Support Agent',
    partnerType: 'INTERNAL',
    description:
      'Customer support agent handling warranty claims and inquiries',
  },
  {
    name: 'Sales Representative',
    partnerType: 'INTERNAL',
    description:
      'Sales team member handling product registrations and customer onboarding',
  },
  {
    name: 'Technician',
    partnerType: 'INTERNAL',
    description: 'Service technician handling repairs and claim inspections',
  },
  {
    name: 'Viewer',
    partnerType: 'INTERNAL',
    description: 'Read-only access to view data without modification rights',
  },
  {
    name: 'Authorized Dealer',
    partnerType: 'EXTERNAL',
    description:
      'External authorized dealer with product registration and warranty access',
  },
  {
    name: 'Service Center',
    partnerType: 'EXTERNAL',
    description: 'External service center handling warranty repairs and claims',
  },
  {
    name: 'Distributor',
    partnerType: 'EXTERNAL',
    description: 'Product distributor with inventory and registration access',
  },
  {
    name: 'Retailer',
    partnerType: 'EXTERNAL',
    description:
      'Retail partner with product registration and customer management',
  },
  {
    name: 'Installer',
    partnerType: 'EXTERNAL',
    description:
      'Installation partner with limited warranty registration access',
  },
  {
    name: 'Inspector',
    partnerType: 'EXTERNAL',
    description:
      'Quality inspector with claim verification and inspection rights',
  },
];

export async function seedDealerTypes(
  prisma: PrismaClient,
  organizations: any[],
  adminUserId: string,
) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  👔 Step 6/8: Seeding Dealer Types           │');
  console.log('└─────────────────────────────────────────────┘\n');

  let total = 0;
  const createdDealerTypes: any[] = [];

  for (const org of organizations) {
    const orgDTs: any[] = [];
    for (const dt of dealerTypeTemplates) {
      try {
        const created = await prisma.dealerType.create({
          data: {
            ...dt,
            orgId: org.id,
            isActive: true,
            createdBy: adminUserId,
            updatedBy: adminUserId,
          },
        });
        orgDTs.push(created);
        total++;
      } catch (error: any) {
        /* skip duplicates */
      }
    }
    createdDealerTypes.push(...orgDTs);
    const internal = orgDTs.filter(
      (d: any) => d.partnerType === 'INTERNAL',
    ).length;
    const external = orgDTs.filter(
      (d: any) => d.partnerType === 'EXTERNAL',
    ).length;
    console.log(
      `   ✅ ${org.name.padEnd(28)} ${orgDTs.length} dealer types (${internal} INT, ${external} EXT)`,
    );
  }

  console.log(`\n   ✅ Total: ${total} dealer types created\n`);
  return { count: total, dealerTypes: createdDealerTypes };
}
