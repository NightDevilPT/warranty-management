import { PrismaClient } from '../../generated/prisma/client';

const organizationsData = [
  {
    name: 'TechServe India',
    companyName: 'TechServe India Private Limited',
    slug: 'techserve-india',
    type: 'ROOT' as const,
    isActive: true,
    parentIndex: undefined,
  },
  {
    name: 'Global Gadgets',
    companyName: 'Global Gadgets Corporation',
    slug: 'global-gadgets',
    type: 'ROOT' as const,
    isActive: true,
    parentIndex: undefined,
  },
  {
    name: 'ElectroCare Solutions',
    companyName: 'ElectroCare Solutions LLP',
    slug: 'electrocare-solutions',
    type: 'ROOT' as const,
    isActive: true,
    parentIndex: undefined,
  },
  {
    name: 'SmartLife Electronics',
    companyName: 'SmartLife Electronics Limited',
    slug: 'smartlife-electronics',
    type: 'ROOT' as const,
    isActive: true,
    parentIndex: undefined,
  },
  {
    name: 'Prime Appliances',
    companyName: 'Prime Appliances International',
    slug: 'prime-appliances',
    type: 'ROOT' as const,
    isActive: true,
    parentIndex: undefined,
  },
  {
    name: 'TechServe Mumbai',
    companyName: 'TechServe India Mumbai Branch',
    slug: 'techserve-mumbai',
    type: 'BRANCH' as const,
    isActive: true,
    parentIndex: 0,
  },
  {
    name: 'TechServe Delhi',
    companyName: 'TechServe India Delhi Branch',
    slug: 'techserve-delhi',
    type: 'BRANCH' as const,
    isActive: true,
    parentIndex: 0,
  },
  {
    name: 'Global Gadgets Bangalore',
    companyName: 'Global Gadgets Bangalore Branch',
    slug: 'global-gadgets-bangalore',
    type: 'BRANCH' as const,
    isActive: true,
    parentIndex: 1,
  },
  {
    name: 'ElectroCare Chennai',
    companyName: 'ElectroCare Solutions Chennai Branch',
    slug: 'electrocare-chennai',
    type: 'BRANCH' as const,
    isActive: true,
    parentIndex: 2,
  },
  {
    name: 'ElectroCare Hyderabad',
    companyName: 'ElectroCare Solutions Hyderabad Branch',
    slug: 'electrocare-hyderabad',
    type: 'BRANCH' as const,
    isActive: false,
    parentIndex: 2,
  },
];

export async function seedOrganizations(
  prisma: PrismaClient,
  count: number,
  adminUserId: string,
) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  🏢 Step 2/8: Seeding Organizations          │');
  console.log('└─────────────────────────────────────────────┘\n');

  const selectedOrgs = organizationsData.slice(0, count);
  const created: any[] = [];

  for (let i = 0; i < selectedOrgs.length; i++) {
    const orgData = selectedOrgs[i];
    try {
      let rootId: string | undefined;
      let parentId: string | undefined;

      if (orgData.type === 'BRANCH' && orgData.parentIndex !== undefined) {
        const parentOrg = created[orgData.parentIndex];
        if (parentOrg && parentOrg.type === 'ROOT') {
          rootId = parentOrg.id;
          parentId = parentOrg.id;
        }
      }

      const org = await prisma.organization.create({
        data: {
          name: orgData.name,
          companyName: orgData.companyName,
          slug: orgData.slug,
          type: orgData.type,
          isActive: orgData.isActive,
          rootId,
          parentId,
          createdBy: adminUserId,
          updatedBy: adminUserId,
        },
      });

      const status = orgData.isActive ? '🟢' : '🔴';
      const type = orgData.type === 'ROOT' ? 'ROOT  ' : 'BRANCH';
      const parent = parentId
        ? ` → ${organizationsData[orgData.parentIndex!].name}`
        : '';
      console.log(
        `   ${status} [${String(i + 1).padStart(2)}] ${org.name.padEnd(28)} ${type}${parent}`,
      );
      created.push(org);
    } catch (e: any) {
      /* skip */
    }
  }

  const rootCount = created.filter((o: any) => o.type === 'ROOT').length;
  const branchCount = created.filter((o: any) => o.type === 'BRANCH').length;
  console.log(
    `\n   ✅ ${created.length} organizations (${rootCount} ROOT, ${branchCount} BRANCH)\n`,
  );
  return created;
}
