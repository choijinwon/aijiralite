// prisma/seed.js
// This is a sample seed file. You can customize it based on your needs.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a sample user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      provider: 'email',
    },
  });

  console.log('Created user:', user.email);

  // Create a sample team
  const team = await prisma.team.upsert({
    where: { id: 'sample-team-id' },
    update: {},
    create: {
      id: 'sample-team-id',
      name: 'Demo Team',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('Created team:', team.name);

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Demo Project',
      description: 'This is a demo project',
      teamId: team.id,
      ownerId: user.id,
    },
  });

  console.log('Created project:', project.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

