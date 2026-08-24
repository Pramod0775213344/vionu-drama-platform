const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanUrl(url) {
  if (!url) return url;
  return url
    .replace(/\/t\/p\/w1284_and_h721_multi_faces\//g, '/t/p/w780/')
    .replace(/\/t\/p\/[^\/]+\//g, (match) => {
      if (match.includes('w500') || match.includes('w780') || match.includes('w1280') || match.includes('original')) {
        return match;
      }
      return '/t/p/w780/';
    });
}

async function run() {
  console.log('Fixing TMDB image sizes in database...');

  const dramas = await prisma.drama.findMany();
  for (const d of dramas) {
    const poster = cleanUrl(d.posterUrl);
    const backdrop = cleanUrl(d.backdropUrl);
    await prisma.drama.update({
      where: { id: d.id },
      data: {
        posterUrl: poster,
        backdropUrl: backdrop,
      },
    });
    console.log('Updated drama images:', d.title, poster, backdrop);
  }

  const episodes = await prisma.episode.findMany();
  for (const ep of episodes) {
    const thumb = cleanUrl(ep.thumbnailUrl);
    await prisma.episode.update({
      where: { id: ep.id },
      data: { thumbnailUrl: thumb },
    });
  }
  console.log('Updated', episodes.length, 'episode thumbnails!');

  const check = await prisma.episode.findFirst();
  console.log('Sample updated episode thumbnail:', check?.thumbnailUrl);
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
