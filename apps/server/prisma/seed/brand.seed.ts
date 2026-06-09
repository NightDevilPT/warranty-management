import { PrismaClient } from '../../generated/prisma/client';

interface BrandSeedData {
  name: string;
  description: string;
  website?: string;
}

/**
 * Popular electronics and appliance brands
 */
const popularBrands: BrandSeedData[] = [
  // Mobile & Electronics Brands
  {
    name: 'Samsung',
    description: 'South Korean multinational electronics company',
    website: 'https://www.samsung.com',
  },
  {
    name: 'Apple',
    description: 'American multinational technology company',
    website: 'https://www.apple.com',
  },
  {
    name: 'Xiaomi',
    description: 'Chinese electronics company',
    website: 'https://www.mi.com',
  },
  {
    name: 'OnePlus',
    description: 'Chinese smartphone manufacturer',
    website: 'https://www.oneplus.com',
  },
  {
    name: 'Google',
    description: 'American technology company - Pixel devices',
    website: 'https://store.google.com',
  },
  {
    name: 'Oppo',
    description: 'Chinese consumer electronics manufacturer',
    website: 'https://www.oppo.com',
  },
  {
    name: 'Vivo',
    description: 'Chinese technology company',
    website: 'https://www.vivo.com',
  },
  {
    name: 'Realme',
    description: 'Chinese smartphone manufacturer',
    website: 'https://www.realme.com',
  },
  {
    name: 'Motorola',
    description: 'American consumer electronics company',
    website: 'https://www.motorola.com',
  },
  {
    name: 'Nokia',
    description: 'Finnish telecommunications company',
    website: 'https://www.nokia.com',
  },

  // Laptop & Computer Brands
  {
    name: 'Dell',
    description: 'American multinational computer technology company',
    website: 'https://www.dell.com',
  },
  {
    name: 'HP',
    description: 'American multinational information technology company',
    website: 'https://www.hp.com',
  },
  {
    name: 'Lenovo',
    description: 'Chinese multinational technology company',
    website: 'https://www.lenovo.com',
  },
  {
    name: 'Asus',
    description: 'Taiwanese multinational computer and electronics company',
    website: 'https://www.asus.com',
  },
  {
    name: 'Acer',
    description: 'Taiwanese multinational hardware and electronics company',
    website: 'https://www.acer.com',
  },
  {
    name: 'MSI',
    description: 'Taiwanese multinational information technology company',
    website: 'https://www.msi.com',
  },

  // TV & Entertainment
  {
    name: 'LG',
    description: 'South Korean multinational electronics company',
    website: 'https://www.lg.com',
  },
  {
    name: 'Sony',
    description: 'Japanese multinational conglomerate corporation',
    website: 'https://www.sony.com',
  },
  {
    name: 'Panasonic',
    description: 'Japanese multinational electronics company',
    website: 'https://www.panasonic.com',
  },
  {
    name: 'TCL',
    description: 'Chinese electronics company',
    website: 'https://www.tcl.com',
  },
  {
    name: 'Hisense',
    description: 'Chinese multinational appliance and electronics manufacturer',
    website: 'https://www.hisense.com',
  },

  // Audio Brands
  {
    name: 'JBL',
    description: 'American audio electronics company',
    website: 'https://www.jbl.com',
  },
  {
    name: 'Bose',
    description: 'American audio equipment company',
    website: 'https://www.bose.com',
  },
  {
    name: 'Sennheiser',
    description: 'German audio company',
    website: 'https://www.sennheiser.com',
  },
  {
    name: 'boAt',
    description: 'Indian consumer electronics brand',
    website: 'https://www.boat-lifestyle.com',
  },

  // Home Appliances
  {
    name: 'Whirlpool',
    description: 'American multinational manufacturer of home appliances',
    website: 'https://www.whirlpool.com',
  },
  {
    name: 'IFB',
    description: 'Indian home appliances company',
    website: 'https://www.ifbappliances.com',
  },
  {
    name: 'Godrej',
    description: 'Indian conglomerate - appliances division',
    website: 'https://www.godrej.com',
  },
  {
    name: 'Voltas',
    description: 'Indian air conditioning and engineering company',
    website: 'https://www.voltas.com',
  },
  {
    name: 'Daikin',
    description: 'Japanese air conditioning manufacturer',
    website: 'https://www.daikin.com',
  },
  {
    name: 'Blue Star',
    description: 'Indian air conditioning company',
    website: 'https://www.bluestarindia.com',
  },
  {
    name: 'Bajaj',
    description: 'Indian multinational company - appliances',
    website: 'https://www.bajajelectricals.com',
  },
  {
    name: 'Philips',
    description: 'Dutch multinational conglomerate',
    website: 'https://www.philips.com',
  },

  // Kitchen Appliances
  {
    name: 'Prestige',
    description: 'Indian kitchen appliances brand',
    website: 'https://www.prestige.co.in',
  },
  {
    name: 'Pigeon',
    description: 'Indian kitchen appliances manufacturer',
    website: 'https://www.pigeonindia.com',
  },
  {
    name: 'Butterfly',
    description: 'Indian kitchen appliances brand',
    website: 'https://www.butterflyindia.com',
  },

  // Camera Brands
  {
    name: 'Canon',
    description: 'Japanese multinational corporation - cameras',
    website: 'https://www.canon.com',
  },
  {
    name: 'Nikon',
    description: 'Japanese multinational corporation - cameras',
    website: 'https://www.nikon.com',
  },
  {
    name: 'GoPro',
    description: 'American technology company - action cameras',
    website: 'https://www.gopro.com',
  },
  {
    name: 'DJI',
    description: 'Chinese technology company - cameras and drones',
    website: 'https://www.dji.com',
  },

  // Gaming
  {
    name: 'PlayStation',
    description: 'Sony gaming console brand',
    website: 'https://www.playstation.com',
  },
  {
    name: 'Xbox',
    description: 'Microsoft gaming console brand',
    website: 'https://www.xbox.com',
  },
  {
    name: 'Nintendo',
    description: 'Japanese gaming company',
    website: 'https://www.nintendo.com',
  },
  {
    name: 'Razer',
    description: 'Gaming hardware manufacturer',
    website: 'https://www.razer.com',
  },
];

/**
 * Seed brands for multiple organizations
 * @param prisma - Prisma client instance
 * @param organizations - Array of organizations to create brands for
 * @param adminUserId - Admin user ID
 * @param brandsPerOrg - Number of brands per organization (default: all)
 */
export async function seedBrands(
  prisma: PrismaClient,
  organizations: any[],
  adminUserId: string,
  brandsPerOrg?: number,
) {
  console.log('🏷️  Seeding Brands...\n');

  let totalCreated = 0;

  for (const org of organizations) {
    // Randomize and pick brands for this organization
    const shuffled = [...popularBrands].sort(() => 0.5 - Math.random());
    const selectedBrands = brandsPerOrg
      ? shuffled.slice(0, brandsPerOrg)
      : shuffled;

    console.log(
      `🏢 Creating brands for: ${org.name} (${selectedBrands.length} brands)`,
    );

    let orgBrandCount = 0;
    for (const brandData of selectedBrands) {
      try {
        const slug = brandData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        await prisma.brand.create({
          data: {
            name: brandData.name,
            slug,
            description: brandData.description,
            website: brandData.website,
            orgId: org.id,
            createdBy: adminUserId,
            updatedBy: adminUserId,
          },
        });

        orgBrandCount++;
      } catch (error) {
        // Skip duplicates (slug violation)
        if (!error.message?.includes('Unique constraint')) {
          console.error(
            `   ❌ Failed to create ${brandData.name}: ${error.message}`,
          );
        }
      }
    }

    console.log(`   ✅ Created ${orgBrandCount} brands for ${org.name}`);
    totalCreated += orgBrandCount;
  }

  console.log(`\n✅ Total brands created: ${totalCreated}\n`);
  return totalCreated;
}
