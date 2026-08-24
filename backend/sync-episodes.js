const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const drama = await prisma.drama.findFirst({
    where: { title: { contains: 'Fights Break Sphere', mode: 'insensitive' } },
  });

  if (!drama) {
    console.log('Drama not found');
    return;
  }

  const targetEpisodes = 40;
  const targetRuntimeMinutes = 44;
  const durationSeconds = targetRuntimeMinutes * 60;

  console.log('Setting drama', drama.title, 'to', targetEpisodes, 'episodes and', targetRuntimeMinutes, 'mins...');

  // Update drama metadata
  await prisma.drama.update({
    where: { id: drama.id },
    data: {
      totalEpisodes: targetEpisodes,
      runtimeMinutes: targetRuntimeMinutes,
    },
  });

  // Delete excess episodes (> 40)
  const deleted = await prisma.episode.deleteMany({
    where: {
      dramaId: drama.id,
      episodeNumber: { gt: targetEpisodes },
    },
  });
  console.log('Deleted', deleted.count, 'excess episodes beyond episode 40.');

  // Update durationSeconds for all remaining episodes
  await prisma.episode.updateMany({
    where: { dramaId: drama.id },
    data: { durationSeconds },
  });

  const remaining = await prisma.episode.count({ where: { dramaId: drama.id } });
  console.log('SUCCESS! Remaining episodes count for', drama.title, ':', remaining);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
