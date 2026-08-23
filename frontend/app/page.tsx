import React from 'react';
import { fetchApi } from '@/lib/api';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TagFilterBar } from '@/components/home/TagFilterBar';
import { ContentRow } from '@/components/home/ContentRow';
import { Drama } from '@/types';

export const dynamic = 'force-dynamic';

const FALLBACK_DRAMAS: Drama[] = [
  {
    id: 'd1',
    title: 'Lovely Runner',
    originalTitle: '선재 엎고 튀어',
    slug: 'lovely-runner',
    description: 'Right after Ryu Sun-jae, a top star, ends his life, Im Sol, his top fan, somehow ends up at a time when they were in high school and tries to protect him. A fantasy romance unfolds where people who missed each other in time finally meet.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/adcdNzLJ8LOjWJjNFrapXGzFco3.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/vbkpl0ps4s5tMTUnC7SFXNzWmVr.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 16,
    runtimeMinutes: 70,
    country: 'KOREA',
    hasSinhalaSub: true,
    averageRating: 9.9,
    ratingCount: 52100,
    isFeatured: true,
    isTrending: true,
    genres: [{ genre: { id: 'g1', name: 'Romance', slug: 'romance' } }],
  },
  {
    id: 'd2',
    title: 'Queen of Tears',
    originalTitle: '눈물의 여왕',
    slug: 'queen-of-tears',
    description: 'The queen of department stores and the prince of supermarkets weather a marital crisis—until love miraculously begins to bloom again.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7ZXLZ3KYL3IVvsSHBZaHjcNQzNU.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/wcP3FsRLog4GNEs9PFrDKKQdcof.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 16,
    runtimeMinutes: 75,
    country: 'KOREA',
    hasSinhalaSub: true,
    averageRating: 9.8,
    ratingCount: 64200,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g1', name: 'Romance', slug: 'romance' } }],
  },
  {
    id: 'd3',
    title: 'The Double',
    originalTitle: '墨雨云间',
    slug: 'the-double-chinese-drama',
    description: 'Xue Fangfei, the daughter of a well-off county magistrate lost everything after a major upheaval. Saved by Jiang Li, she took on her identity to return to the capital and expose deep corruption.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/u4zFeoSUlqp18yPbzppi5oZRlgH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/f0i9Fg9Krg2oXONxDdaf2yAJmJ3.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 40,
    runtimeMinutes: 45,
    country: 'CHINA',
    hasSinhalaSub: true,
    averageRating: 9.9,
    ratingCount: 48900,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g3', name: 'Historical', slug: 'historical' } }],
  },
  {
    id: 'd4',
    title: 'Amidst a Snowstorm of Love',
    originalTitle: '在暴雪时分',
    slug: 'amidst-a-snowstorm-of-love',
    description: 'As a professional billiards player, Yin Guo has become quite a notable athlete. Meeting former professional player Lin Yiyang during a blizzard night in a foreign town will change her life forever.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1v5ABzgSMlVJG2acb6S6JAkEM2S.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/2EiNPJuZMTY7Bm9setnS1GqhGAl.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 30,
    runtimeMinutes: 45,
    country: 'CHINA',
    hasSinhalaSub: true,
    averageRating: 9.6,
    ratingCount: 31200,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g1', name: 'Romance', slug: 'romance' } }],
  },
  {
    id: 'd5',
    title: 'Love Next Door',
    originalTitle: '엄마친구아들',
    slug: 'love-next-door',
    description: 'A woman attempting to reboot her life returns to Korea and becomes entangled with her childhood friend — with whom she shares a complicated history.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hikbLeofw2epfaEJptSkQ6b22IV.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/blNanzce8lKnrfjDqWLdPNPy7mo.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 16,
    runtimeMinutes: 70,
    country: 'KOREA',
    hasSinhalaSub: true,
    averageRating: 9.5,
    ratingCount: 29800,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g1', name: 'Romance', slug: 'romance' } }],
  },
  {
    id: 'd6',
    title: 'Blossoms in Adversity',
    originalTitle: '惜花芷',
    slug: 'blossoms-in-adversity',
    description: 'A devastating tragedy of asset forfeiture befalls the Hua family suddenly. The young lady Hua Zhi steps up and leads the women of her household toward a brighter future.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mnEkVpuuFo3kzGi8d4ZEqgEDT8d.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/vy5MxpEJ2IzZm8773lvsK8IoQib.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 40,
    runtimeMinutes: 45,
    country: 'CHINA',
    hasSinhalaSub: true,
    averageRating: 9.7,
    ratingCount: 24500,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g3', name: 'Historical', slug: 'historical' } }],
  },
  {
    id: 'd7',
    title: 'Marry My Husband',
    originalTitle: '내 남편과 결혼해줘',
    slug: 'marry-my-husband',
    description: 'Kang Ji-won, killed by her husband and best friend after discovering their affair, wakes up 10 years before the incident and decides to seek revenge and reclaim her fate.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/899KcBqooj8nEyPcAEU3h7AdfUo.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/qHCXeAM13OYvcmjXeOhtvXfc8uo.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 16,
    runtimeMinutes: 65,
    country: 'KOREA',
    hasSinhalaSub: true,
    averageRating: 9.6,
    ratingCount: 42100,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g5', name: 'Fantasy', slug: 'fantasy' } }],
  },
  {
    id: 'd8',
    title: 'Twinkling Watermelon',
    originalTitle: '반짝이는 워터멜론',
    slug: 'twinkling-watermelon',
    description: 'A CODA student born with a gift for music crash lands at an unfamiliar place after time traveling through a suspicious music shop, forming a band with mysterious youths.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/bwTzW1wTgUxUOQruhT8DvinUYgR.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1284_and_h721_multi_faces/efaMS00Fevc3fw2dbeP7rh22O6D.jpg',
    releaseYear: 2024,
    status: 'COMPLETED',
    totalEpisodes: 16,
    runtimeMinutes: 70,
    country: 'KOREA',
    hasSinhalaSub: true,
    averageRating: 9.8,
    ratingCount: 38900,
    isFeatured: false,
    isTrending: true,
    genres: [{ genre: { id: 'g5', name: 'Fantasy', slug: 'fantasy' } }],
  },
];




async function getHomeData() {
  try {
    return await fetchApi<{
      featured: Drama;
      trending: Drama[];
      popular: Drama[];
      latest: Drama[];
      topRated: Drama[];
      romance: Drama[];
      action: Drama[];
    }>('/dramas/home', { cache: 'no-store' });
  } catch (error) {
    console.error('Failed to fetch home page data from backend:', error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  // Use backend data if available, otherwise use FALLBACK_DRAMAS
  const featuredDrama = data?.featured || FALLBACK_DRAMAS.find((d) => d.isFeatured) || FALLBACK_DRAMAS[0];
  const popularDramas = data?.popular && data.popular.length > 0 ? data.popular : FALLBACK_DRAMAS;
  const trendingDramas = data?.trending && data.trending.length > 0 ? data.trending : FALLBACK_DRAMAS;
  const latestDramas = data?.latest && data.latest.length > 0 ? data.latest : FALLBACK_DRAMAS;
  const romanceDramas = data?.romance && data.romance.length > 0 ? data.romance : FALLBACK_DRAMAS;
  const topRatedDramas = data?.topRated && data.topRated.length > 0 ? data.topRated : FALLBACK_DRAMAS;

  const heroItems = [
    featuredDrama,
    ...trendingDramas.filter((d) => d.id !== featuredDrama.id).slice(0, 5),
  ];

  return (
    <div className="w-full bg-[#0E1015] min-h-screen text-slate-100 pb-20 space-y-2">
      {/* 1. Hero Banner Carousel (Screenshot 2: 'The Fire 4 Elements' style) */}
      <HeroBanner drama={featuredDrama} dramas={heroItems} />

      <div className="max-w-[1700px] mx-auto space-y-4">
        {/* 2. Popular on iQIYI Row (Screenshot 1 & 2) */}
        <div id="popular">
          <ContentRow
            title="Popular on iQIYI"
            subtitle="ජනප්‍රියතම ආසියානු කතාමාලා (සිංහල SUB)"
            dramas={popularDramas}
            aspect="poster"
            isTop10={true}
          />
        </div>

        {/* 3. Category Tag Filter Bar (Screenshot 1) */}
        <TagFilterBar />


        {/* 5. Top Picks for You Row (Screenshot 1) */}
        <div id="top-picks">
          <ContentRow
            title="Top Picks for You"
            subtitle="ඔබට පෞද්ගලිකව නිර්දේශිත K-Dramas & C-Dramas"
            dramas={trendingDramas}
            aspect="poster"
          />
        </div>

        {/* 6. Additional Rows */}
        <ContentRow
          title="⚡ Direct High-Speed Download (1080p / 720p / 480p)"
          subtitle="1080p, 720p සහ 480p ඍජුවම Download කරගත හැකි කතාමාලා"
          dramas={latestDramas}
          aspect="backdrop"
        />

        <ContentRow
          title="💖 Romance & Sweet Love Series"
          subtitle="ආදරණීය කොරියානු සහ චීන කතාමාලා"
          dramas={romanceDramas}
          aspect="poster"
        />

        <ContentRow
          title="⭐ Top Rated Masterpieces"
          subtitle="iQIYI & IMDb ප්‍රේක්ෂක ඇගයීම් ඉහළම නාට්‍ය"
          dramas={topRatedDramas}
          aspect="poster"
        />
      </div>
    </div>
  );
}


