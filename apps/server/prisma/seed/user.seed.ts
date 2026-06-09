// apps/server/prisma/seed/user.seed.ts
import { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding Users...\n');

  const adminEmail = 'pawankumartadagsingh@gmail.com';
  const adminPassword = 'Admin@123';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists!');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Role: ${existingAdmin.role}`);
    console.log(`   ID: ${existingAdmin.id}`);

    // Update password and ensure correct role
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: true,
        isActive: true,
        firstName: 'Pawan',
        lastName: 'Kumar',
        fullName: 'Pawan Kumar',
      },
    });

    console.log('✅ Admin user updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', adminEmail);
    console.log('🔑 Password: ', adminPassword);
    console.log('👤 Role:     ADMIN');
    console.log('🆔 ID:       ', existingAdmin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return existingAdmin;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      phoneNumber: '+919876543210',
      firstName: 'Pawan',
      lastName: 'Kumar',
      fullName: 'Pawan Kumar',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:    ', admin.email);
  console.log('🔑 Password: ', adminPassword);
  console.log('👤 Role:     ', admin.role);
  console.log('🆔 ID:       ', admin.id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return admin;
}
