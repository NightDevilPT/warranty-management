// apps/server/prisma/seed/user.seed.ts
import { PrismaClient, UserRole } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding Users...');

  const adminEmail = 'pawankumartadagsingh@gmail.com';
  const adminPassword = 'Admin@123';
  const adminPhone = '+919876543210';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Role: ${existingAdmin.role}`);

    if (existingAdmin.role !== UserRole.ADMIN) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: UserRole.ADMIN },
      });
      console.log('✅ Updated to ADMIN role');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Admin updated\n');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      phoneNumber: adminPhone,
      firstName: 'Pawan',
      lastName: 'Kumar',
      fullName: 'Pawan Kumar',
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin created!');
  console.log(`📧 ${admin.email}`);
  console.log(`🔑 ${adminPassword}`);
  console.log('');
}
