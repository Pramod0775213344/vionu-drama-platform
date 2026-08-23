import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting K-Flix Database Seeding...');

  // Clean existing tables
  await prisma.notification.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.watchHistory.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.dramaActor.deleteMany();
  await prisma.actor.deleteMany();
  await prisma.dramaGenre.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.drama.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kdrama.com',
      passwordHash: adminPassword,
      name: 'K-Flix Director (Admin)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@kdrama.com',
      passwordHash: userPassword,
      name: 'Min-ji Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      role: 'USER',
    },
  });

  console.log('✅ Users created: admin@kdrama.com, user@kdrama.com');

  // 2. Seed Genres
  const genresData = [
    { name: 'Romance', slug: 'romance' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Action', slug: 'action' },
    { name: 'Thriller', slug: 'thriller' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Historical', slug: 'historical' },
    { name: 'Mystery', slug: 'mystery' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Crime', slug: 'crime' },
  ];

  const genres: Record<string, any> = {};
  for (const g of genresData) {
    genres[g.slug] = await prisma.genre.create({ data: g });
  }

  // 3. Seed Actors
  const actorsData = [
    {
      name: 'Kim Soo-hyun',
      originalName: '김수현',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'One of the highest-paid actors in South Korea, celebrated for Queen of Tears and It’s Okay to Not Be Okay.',
      birthDate: '1988-02-16',
    },
    {
      name: 'Kim Ji-won',
      originalName: '김지원',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Award-winning actress known for Queen of Tears, Fight for My Way, and Descendants of the Sun.',
      birthDate: '1992-10-19',
    },
    {
      name: 'Hyun Bin',
      originalName: '현빈',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'Iconic Hallyu star starring in Crash Landing on You and Secret Garden.',
      birthDate: '1982-09-25',
    },
    {
      name: 'Son Ye-jin',
      originalName: '손예진',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'Legendary actress renowned for Crash Landing on You and Something in the Rain.',
      birthDate: '1982-01-11',
    },
    {
      name: 'Gong Yoo',
      originalName: '공유',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      bio: 'Globally recognized for Guardian: The Lonely and Great God (Goblin), Train to Busan, and Squid Game.',
      birthDate: '1979-07-10',
    },
    {
      name: 'Song Joong-ki',
      originalName: '송중기',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      bio: 'Charismatic leading actor famous for Vincenzo, Reborn Rich, and Descendants of the Sun.',
      birthDate: '1985-09-19',
    },
  ];

  const actors: Record<string, any> = {};
  for (const a of actorsData) {
    actors[a.name] = await prisma.actor.create({ data: a });
  }

  // Sample stream video links (reliable CDN sample MP4/HLS streams for streaming player test)
  const sampleVideo1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  const sampleVideo2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
  const sampleVideo3 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // 4. Seed Fresh New Set of Asian Dramas (Official TMDB Posters)
  const dramasData = [
    {
      title: 'Lovely Runner',
      originalTitle: '선재 엎고 튀어',
      slug: 'lovely-runner',
      description: 'Right after Ryu Sun-jae, a top star, ends his life, Im Sol, his top fan, somehow ends up at a time when they were in high school and tries to protect him. A fantasy romance unfolds where people who missed each other in time finally meet.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/adcdNzLJ8LOjWJjNFrapXGzFco3.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/vbkpl0ps4s5tMTUnC7SFXNzWmVr.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 16,
      runtimeMinutes: 70,
      director: 'Yoon Jong-ho',
      screenwriter: 'Lee Si-eun',
      studio: 'tvN / Viki',
      country: 'KOREA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.9,
      ratingCount: 52100,
      isFeatured: true,
      isTrending: true,
      genres: [genres['romance'], genres['fantasy'], genres['comedy']],
      cast: [],
    },
    {
      title: 'Queen of Tears',
      originalTitle: '눈물의 여왕',
      slug: 'queen-of-tears',
      description: 'The queen of department stores and the prince of supermarkets weather a marital crisis—until love miraculously begins to bloom again.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/7ZXLZ3KYL3IVvsSHBZaHjcNQzNU.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/wcP3FsRLog4GNEs9PFrDKKQdcof.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 16,
      runtimeMinutes: 75,
      director: 'Jang Young-woo, Kim Hee-won',
      screenwriter: 'Park Ji-eun',
      studio: 'tvN / Netflix',
      country: 'KOREA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.8,
      ratingCount: 64200,
      isFeatured: false,
      isTrending: true,
      genres: [genres['romance'], genres['drama'], genres['comedy']],
      cast: [],
    },
    {
      title: 'The Double',
      originalTitle: '墨雨云间',
      slug: 'the-double-chinese-drama',
      description: 'Xue Fangfei, the daughter of a well-off county magistrate lost everything after a major upheaval. Saved by Jiang Li, she took on her identity to return to the capital and expose deep corruption.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/u4zFeoSUlqp18yPbzppi5oZRlgH.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/f0i9Fg9Krg2oXONxDdaf2yAJmJ3.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 40,
      runtimeMinutes: 45,
      director: 'Lyu Hao Ji Ji',
      screenwriter: 'Qian Zhi Ye',
      studio: 'Youku / iQIYI',
      country: 'CHINA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.9,
      ratingCount: 48900,
      isFeatured: false,
      isTrending: true,
      genres: [genres['historical'], genres['romance'], genres['drama']],
      cast: [],
    },
    {
      title: 'Amidst a Snowstorm of Love',
      originalTitle: '在暴雪时分',
      slug: 'amidst-a-snowstorm-of-love',
      description: 'As a professional billiards player, Yin Guo has become quite a notable athlete. Meeting former professional player Lin Yiyang during a blizzard night in a foreign town will change her life forever.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/1v5ABzgSMlVJG2acb6S6JAkEM2S.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/2EiNPJuZMTY7Bm9setnS1GqhGAl.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 30,
      runtimeMinutes: 45,
      director: 'Tien Jen Huang',
      screenwriter: 'Mo Bao Fei Bao',
      studio: 'Tencent / iQIYI',
      country: 'CHINA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.6,
      ratingCount: 31200,
      isFeatured: false,
      isTrending: true,
      genres: [genres['romance'], genres['drama']],
      cast: [],
    },
    {
      title: 'Love Next Door',
      originalTitle: '엄마친구아들',
      slug: 'love-next-door',
      description: 'A woman attempting to reboot her life returns to Korea and becomes entangled with her childhood friend — with whom she shares a complicated history.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/hikbLeofw2epfaEJptSkQ6b22IV.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/blNanzce8lKnrfjDqWLdPNPy7mo.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 16,
      runtimeMinutes: 70,
      director: 'Yoo Je-won',
      screenwriter: 'Shin Ha-eun',
      studio: 'tvN / Netflix',
      country: 'KOREA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.5,
      ratingCount: 29800,
      isFeatured: false,
      isTrending: true,
      genres: [genres['romance'], genres['comedy']],
      cast: [],
    },
    {
      title: 'Blossoms in Adversity',
      originalTitle: '惜花芷',
      slug: 'blossoms-in-adversity',
      description: 'A devastating tragedy of asset forfeiture befalls the Hua family suddenly. The young lady Hua Zhi steps up and leads the women of her household toward a brighter future.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/mnEkVpuuFo3kzGi8d4ZEqgEDT8d.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/vy5MxpEJ2IzZm8773lvsK8IoQib.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 40,
      runtimeMinutes: 45,
      director: 'Zhu Rui Bin',
      screenwriter: 'He Yu',
      studio: 'Youku / iQIYI',
      country: 'CHINA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.7,
      ratingCount: 24500,
      isFeatured: false,
      isTrending: true,
      genres: [genres['historical'], genres['romance'], genres['drama']],
      cast: [],
    },
    {
      title: 'Marry My Husband',
      originalTitle: '내 남편과 결혼해줘',
      slug: 'marry-my-husband',
      description: 'Kang Ji-won, killed by her husband and best friend after discovering their affair, wakes up 10 years before the incident and decides to seek revenge and reclaim her fate.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/899KcBqooj8nEyPcAEU3h7AdfUo.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/qHCXeAM13OYvcmjXeOhtvXfc8uo.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 16,
      runtimeMinutes: 65,
      director: 'Park Won-guk',
      screenwriter: 'Shin Yoo-dam',
      studio: 'tvN / Prime Video',
      country: 'KOREA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.6,
      ratingCount: 42100,
      isFeatured: false,
      isTrending: true,
      genres: [genres['fantasy'], genres['romance'], genres['drama']],
      cast: [],
    },
    {
      title: 'Twinkling Watermelon',
      originalTitle: '반짝이는 워터멜론',
      slug: 'twinkling-watermelon',
      description: 'A CODA student born with a gift for music crash lands at an unfamiliar place after time traveling through a suspicious music shop, forming a band with mysterious youths.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/bwTzW1wTgUxUOQruhT8DvinUYgR.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/efaMS00Fevc3fw2dbeP7rh22O6D.jpg',
      releaseYear: 2024,
      status: 'COMPLETED',
      totalEpisodes: 16,
      runtimeMinutes: 70,
      director: 'Son Jung-hyun',
      screenwriter: 'Jin Soo-wan',
      studio: 'tvN / Viki',
      country: 'KOREA',
      hasSinhalaSub: true,
      translatorName: 'K-Flix Sub Team',
      averageRating: 9.8,
      ratingCount: 38900,
      isFeatured: false,
      isTrending: true,
      genres: [genres['fantasy'], genres['romance'], genres['comedy']],
      cast: [],
    },
  ];





  for (const d of dramasData) {
    const { genres: gList, cast: cList, ...dramaFields } = d;

    // Fetch real TMDB Posters & Backdrops automatically
    try {
      const apiKey = process.env.TMDB_API_KEY || 'e42e5d9c79ecf91a5e1eb2aa8bf3ff70';
      const cleanTitle = d.title.replace(/\([^)]*\)/g, '').trim();
      const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}`);
      if (tmdbRes.ok) {
        const tmdbData = await tmdbRes.json();
        const item = (tmdbData.results || []).find((r: any) => r.poster_path) || tmdbData.results?.[0];
        if (item && item.poster_path) {
          dramaFields.posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
          if (item.backdrop_path) {
            dramaFields.backdropUrl = `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`;
          }
        }
      }
    } catch (e) {
      console.log(`Using fallback poster for ${d.title}`);
    }

    const drama = await prisma.drama.create({
      data: dramaFields,
    });


    // Link Genres
    for (const g of gList) {
      if (g) {
        await prisma.dramaGenre.create({
          data: { dramaId: drama.id, genreId: g.id },
        });
      }
    }

    // Link Cast
    for (const c of cList) {
      if (c && c.actor) {
        await prisma.dramaActor.create({
          data: {
            dramaId: drama.id,
            actorId: c.actor.id,
            characterName: c.characterName,
            roleType: c.roleType,
          },
        });
      }
    }

    // Create Season 1 & Episodes
    const season = await prisma.season.create({
      data: {
        dramaId: drama.id,
        seasonNumber: 1,
        title: 'Season 1',
        releaseYear: d.releaseYear,
      },
    });

    // Create 6 realistic episodes per drama
    const episodeTitles = [
      'The Unexpected Encounter',
      'Whispers in the Rain',
      'The Turning Point',
      'Unspoken Truths',
      'Crossroads of Fate',
      'A Promise Across Time',
    ];

    for (let i = 1; i <= Math.min(6, d.totalEpisodes); i++) {
      const vUrl = i % 3 === 1 ? sampleVideo1 : i % 3 === 2 ? sampleVideo2 : sampleVideo3;
      await prisma.episode.create({
        data: {
          seasonId: season.id,
          dramaId: drama.id,
          episodeNumber: i,
          title: `Episode ${i}: ${episodeTitles[i - 1]}`,
          description: `Episode ${i} of ${d.title}. Captivating twists and emotional momentum unfold in this high-stakes episode.`,
          thumbnailUrl: d.backdropUrl,
          videoUrl: vUrl,
          videoProvider: 'CLOUDFLARE_STREAM',
          durationSeconds: d.runtimeMinutes * 60,
          isPremium: i > 2,
          releaseDate: `${d.releaseYear}-03-${10 + i}`,
        },
      });
    }
  }

  console.log('✅ 7 Premium K-Dramas seeded with full seasons and episodes!');

  // Seed initial reviews
  const queenOfTears = await prisma.drama.findUnique({ where: { slug: 'queen-of-tears' } });
  if (queenOfTears) {
    await prisma.review.create({
      data: {
        userId: user.id,
        dramaId: queenOfTears.id,
        content: 'Absolute masterpiece! The chemistry between Kim Soo-hyun and Kim Ji-won is unmatched. 10/10 rating!',
        rating: 10,
      },
    });

    await prisma.watchlist.create({
      data: {
        userId: user.id,
        dramaId: queenOfTears.id,
      },
    });
  }

  console.log('🎉 K-Flix Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
