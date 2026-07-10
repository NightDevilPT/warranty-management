import { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  👤 Step 1/8: Seeding Users                  │');
  console.log('└─────────────────────────────────────────────┘\n');

  const adminEmail = 'pawankumartadagsingh@gmail.com';
  const adminPassword = 'Admin@123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    const updatedAdmin = await prisma.user.update({
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
    console.log('   ✅ Admin user updated successfully\n');
    return [updatedAdmin];
  }

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

  console.log('   ✅ Admin user created successfully\n');
  return [admin];
}
