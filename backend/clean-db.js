const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const fbs = await prisma.drama.findFirst({
    where: { title: { contains: 'Fights Break Sphere', mode: 'insensitive' } },
  });

  if (!fbs) {
    console.log('Error: Fights Break Sphere not found in DB!');
    return;
  }

  console.log('Keeping drama:', fbs.title, '(ID:', fbs.id, ')');

  const toDelete = await prisma.drama.findMany({
    where: { id: { not: fbs.id } },
  });

  console.log('Found', toDelete.length, 'dramas to delete.');

  for (const d of toDelete) {
    await prisma.review.deleteMany({ where: { dramaId: d.id } });
    await prisma.rating.deleteMany({ where: { dramaId: d.id } });
    await prisma.watchlist.deleteMany({ where: { dramaId: d.id } });
    await prisma.watchHistory.deleteMany({ where: { dramaId: d.id } });
    await prisma.dramaActor.deleteMany({ where: { dramaId: d.id } });
    await prisma.dramaGenre.deleteMany({ where: { dramaId: d.id } });
    await prisma.episode.deleteMany({ where: { dramaId: d.id } });
    await prisma.season.deleteMany({ where: { dramaId: d.id } });
    await prisma.drama.delete({ where: { id: d.id } });
    console.log('Deleted drama:', d.title);
  }

  await prisma.drama.update({
    where: { id: fbs.id },
    data: { isFeatured: true, isTrending: true },
  });

  const remaining = await prisma.drama.findMany({ select: { id: true, title: true } });
  console.log('SUCCESS! Remaining dramas in DB:', remaining);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
