// apps/server/prisma/seed/user.seed.ts
import { PrismaClient, UserRole } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding Users...\n');

  const adminEmail = 'pawankumartadagsingh@gmail.com';
  const adminPassword = 'Admin@123';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Delete existing admin if exists (to get fresh ID)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        role: UserRole.ADMIN,
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Admin user updated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('👤 Role:     ', 'ADMIN');
    console.log('🆔 ID:       ', existingAdmin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return existingAdmin;
  }

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      phoneNumber: '+919876543210',
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

  console.log('✅ Admin user created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:    ', admin.email);
  console.log('🔑 Password: ', adminPassword);
  console.log('👤 Role:     ', admin.role);
  console.log('🆔 ID:       ', admin.id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return admin;
}
