import { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const STAFF_PASSWORD = 'Staff@123';
const PARTNER_PASSWORD = 'Partner@123';

interface StaffUserSeed {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  role: string;
  partnerType: string;
  portalType: string;
  dealerTypeName: string | null;
  assignedOrgSlugs: string[];
}

const staffUsers: StaffUserSeed[] = [
  // COMPANY_SUPER_ADMIN for each ROOT org
  {
    email: 'admin@techserve.com',
    firstName: 'Vikash',
    lastName: 'Mehta',
    phoneNumber: '+919876543201',
    password: STAFF_PASSWORD,
    role: 'COMPANY_SUPER_ADMIN',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: null,
    assignedOrgSlugs: ['techserve-india'],
  },
  {
    email: 'admin@globalgadgets.com',
    firstName: 'Rohit',
    lastName: 'Kapoor',
    phoneNumber: '+919876543202',
    password: STAFF_PASSWORD,
    role: 'COMPANY_SUPER_ADMIN',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: null,
    assignedOrgSlugs: ['global-gadgets'],
  },
  {
    email: 'admin@electrocare.com',
    firstName: 'Sunita',
    lastName: 'Iyer',
    phoneNumber: '+919876543203',
    password: STAFF_PASSWORD,
    role: 'COMPANY_SUPER_ADMIN',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: null,
    assignedOrgSlugs: ['electrocare-solutions'],
  },
  {
    email: 'admin@smartlife.com',
    firstName: 'Karan',
    lastName: 'Malhotra',
    phoneNumber: '+919876543204',
    password: STAFF_PASSWORD,
    role: 'COMPANY_SUPER_ADMIN',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: null,
    assignedOrgSlugs: ['smartlife-electronics'],
  },
  {
    email: 'admin@primeappliances.com',
    firstName: 'Lakshmi',
    lastName: 'Venkatesh',
    phoneNumber: '+919876543205',
    password: STAFF_PASSWORD,
    role: 'COMPANY_SUPER_ADMIN',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: null,
    assignedOrgSlugs: ['prime-appliances'],
  },
  // COMPANY_STAFF - TechServe India
  {
    email: 'raj.sharma@techserve.com',
    firstName: 'Raj',
    lastName: 'Sharma',
    phoneNumber: '+919876543211',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Manager',
    assignedOrgSlugs: ['techserve-india', 'techserve-mumbai'],
  },
  {
    email: 'priya.patel@techserve.com',
    firstName: 'Priya',
    lastName: 'Patel',
    phoneNumber: '+919876543212',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Support Agent',
    assignedOrgSlugs: ['techserve-india', 'techserve-delhi'],
  },
  {
    email: 'amit.verma@techserve.com',
    firstName: 'Amit',
    lastName: 'Verma',
    phoneNumber: '+919876543213',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Sales Representative',
    assignedOrgSlugs: ['techserve-india'],
  },
  {
    email: 'suresh.kumar@techserve.com',
    firstName: 'Suresh',
    lastName: 'Kumar',
    phoneNumber: '+919876543214',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Technician',
    assignedOrgSlugs: ['techserve-mumbai', 'techserve-delhi'],
  },
  {
    email: 'neha.gupta@techserve.com',
    firstName: 'Neha',
    lastName: 'Gupta',
    phoneNumber: '+919876543216',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Viewer',
    assignedOrgSlugs: ['techserve-india'],
  },
  // COMPANY_STAFF - Global Gadgets
  {
    email: 'vikram.singh@globalgadgets.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    phoneNumber: '+919876543221',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Manager',
    assignedOrgSlugs: ['global-gadgets', 'global-gadgets-bangalore'],
  },
  {
    email: 'anjali.rao@globalgadgets.com',
    firstName: 'Anjali',
    lastName: 'Rao',
    phoneNumber: '+919876543222',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Support Agent',
    assignedOrgSlugs: ['global-gadgets'],
  },
  // COMPANY_STAFF - ElectroCare
  {
    email: 'deepak.nair@electrocare.com',
    firstName: 'Deepak',
    lastName: 'Nair',
    phoneNumber: '+919876543231',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Manager',
    assignedOrgSlugs: ['electrocare-solutions', 'electrocare-chennai'],
  },
  {
    email: 'kavitha.menon@electrocare.com',
    firstName: 'Kavitha',
    lastName: 'Menon',
    phoneNumber: '+919876543232',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Technician',
    assignedOrgSlugs: ['electrocare-chennai', 'electrocare-hyderabad'],
  },
  // COMPANY_STAFF - SmartLife
  {
    email: 'arun.joshi@smartlife.com',
    firstName: 'Arun',
    lastName: 'Joshi',
    phoneNumber: '+919876543251',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Manager',
    assignedOrgSlugs: ['smartlife-electronics'],
  },
  // COMPANY_STAFF - Prime
  {
    email: 'meera.reddy@primeappliances.com',
    firstName: 'Meera',
    lastName: 'Reddy',
    phoneNumber: '+919876543261',
    password: STAFF_PASSWORD,
    role: 'COMPANY_STAFF',
    partnerType: 'INTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Support Agent',
    assignedOrgSlugs: ['prime-appliances'],
  },
  // COMPANY_PARTNER (EXTERNAL)
  {
    email: 'ramesh.patel@partner.com',
    firstName: 'Ramesh',
    lastName: 'Patel',
    phoneNumber: '+919876543241',
    password: PARTNER_PASSWORD,
    role: 'COMPANY_PARTNER',
    partnerType: 'EXTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Authorized Dealer',
    assignedOrgSlugs: ['techserve-india', 'global-gadgets'],
  },
  {
    email: 'thomas.jose@partner.com',
    firstName: 'Thomas',
    lastName: 'Jose',
    phoneNumber: '+919876543242',
    password: PARTNER_PASSWORD,
    role: 'COMPANY_PARTNER',
    partnerType: 'EXTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Service Center',
    assignedOrgSlugs: ['electrocare-solutions'],
  },
  {
    email: 'arif.khan@partner.com',
    firstName: 'Arif',
    lastName: 'Khan',
    phoneNumber: '+919876543243',
    password: PARTNER_PASSWORD,
    role: 'COMPANY_PARTNER',
    partnerType: 'EXTERNAL',
    portalType: 'STAFF',
    dealerTypeName: 'Distributor',
    assignedOrgSlugs: ['techserve-india'],
  },
];

export async function seedUserAccess(
  prisma: PrismaClient,
  adminUser: any,
  organizations: any[],
  dealerTypes: any[],
) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  👥 Step 7/8: Seeding User Access            │');
  console.log('└─────────────────────────────────────────────┘\n');

  const orgBySlug = new Map<string, any>();
  organizations.forEach((org) => orgBySlug.set(org.slug, org));

  const dtByOrgAndName = new Map<string, any>();
  dealerTypes.forEach((dt) => dtByOrgAndName.set(`${dt.orgId}:${dt.name}`, dt));

  let totalCreated = 0;
  const staffHash = await bcrypt.hash(STAFF_PASSWORD, 10);
  const partnerHash = await bcrypt.hash(PARTNER_PASSWORD, 10);

  // Add platform admin to all ROOT orgs as COMPANY_SUPER_ADMIN
  const rootOrgs = organizations.filter((o: any) => o.type === 'ROOT');
  console.log('   👑 Platform Admin → ROOT organizations:');
  for (const org of rootOrgs) {
    try {
      await prisma.userAccess.upsert({
        where: { userId_orgId: { userId: adminUser.id, orgId: org.id } },
        update: {
          role: 'COMPANY_SUPER_ADMIN',
          partnerType: 'INTERNAL',
          portalType: 'STAFF',
        },
        create: {
          userId: adminUser.id,
          orgId: org.id,
          portalType: 'STAFF',
          role: 'COMPANY_SUPER_ADMIN',
          partnerType: 'INTERNAL',
          dealerTypeId: null,
        },
      });
      console.log(`      ✅ ${org.name}`);
      totalCreated++;
    } catch (e: any) {
      /* skip */
    }
  }

  // Create staff/partner users
  console.log('\n   👤 Staff & Partner Users:');
  for (const userData of staffUsers) {
    try {
      let user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      const hash =
        userData.role === 'COMPANY_PARTNER' ? partnerHash : staffHash;

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: `${userData.firstName} ${userData.lastName}`,
            passwordHash: hash,
            role: userData.role as any,
            emailVerified: true,
            phoneVerified: true,
            isActive: true,
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: hash,
            role: userData.role as any,
            emailVerified: true,
            phoneVerified: true,
            isActive: true,
          },
        });
      }

      for (const orgSlug of userData.assignedOrgSlugs) {
        const org = orgBySlug.get(orgSlug);
        if (!org) continue;

        const dt = userData.dealerTypeName
          ? dtByOrgAndName.get(`${org.id}:${userData.dealerTypeName}`)
          : null;

        try {
          await prisma.userAccess.upsert({
            where: { userId_orgId: { userId: user.id, orgId: org.id } },
            update: {
              role: userData.role,
              partnerType: userData.partnerType,
              portalType: userData.portalType,
              dealerTypeId: dt?.id || null,
            },
            create: {
              userId: user.id,
              orgId: org.id,
              portalType: userData.portalType,
              role: userData.role,
              partnerType: userData.partnerType,
              dealerTypeId: dt?.id || null,
            },
          });
          totalCreated++;
        } catch (e: any) {
          /* skip */
        }
      }

      const orgList = userData.assignedOrgSlugs.length;
      const dtLabel = userData.dealerTypeName || 'No DealerType';
      console.log(
        `      ✅ ${userData.email.padEnd(35)} ${userData.role.padEnd(20)} ${dtLabel.padEnd(22)} → ${orgList} org(s)`,
      );
    } catch (e: any) {
      /* skip */
    }
  }

  console.log(`\n   ✅ Total: ${totalCreated} user access records\n`);
  return totalCreated;
}
