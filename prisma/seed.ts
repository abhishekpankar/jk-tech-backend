// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { genSalt, hash } from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  async function generatePasswordHash(plainPassword: string) {
    const salt = await genSalt(10);
    return hash(plainPassword, salt);
  }

  await prisma.role.createMany({
    data: [
      {
        name: 'Admin',
      },
      {
        name: 'PowerUser',
      },
      {
        name: 'User',
      },
    ],
  });

  const userRole = await prisma.role.findFirst({
    where: {
      name: 'User',
    },
  });
  const userRoleId = userRole.id;

  const users = await Promise.all(
    Array.from({ length: 1000 }).map(async () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      roleId: userRoleId,
      password: await generatePasswordHash('pass@123'),
    })),
  );

  // Seed users
  await prisma.user.createMany({
    data: users,
  });

  console.log('Database seeding completed!');
}

seed()
  .catch((err) => {
    console.log('Seed Error: ', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
