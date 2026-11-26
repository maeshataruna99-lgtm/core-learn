import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Idempotent: upsert on a unique key, so running the seed twice never duplicates users.
async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com' },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob', email: 'bob@example.com' },
  });

  // Tickets have no natural unique key, so only seed them into an empty table.
  if ((await prisma.ticket.count()) === 0) {
    await prisma.ticket.createMany({
      data: [
        { title: 'Fix login rate limit', priority: 'HIGH', assigneeId: alice.id },
        { title: 'Write API docs', priority: 'LOW', assigneeId: bob.id },
        { title: 'Upgrade dependencies', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: alice.id },
        { title: 'Remove dead code', priority: 'LOW', status: 'DONE' },
      ],
    });
  }
  console.log('Seed done');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
