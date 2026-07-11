import { PrismaClient } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│  👤 Seeding Platform Administrator          │');
  console.log('└─────────────────────────────────────────────┘\n');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'pawankumartadagsingh@gmail.com',
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

  console.log('   ✅ Platform administrator created successfully\n');

  return admin;
}
