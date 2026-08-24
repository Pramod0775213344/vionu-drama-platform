import React from 'react';
import { fetchApi } from '@/lib/api';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TagFilterBar } from '@/components/home/TagFilterBar';
import { ContentRow } from '@/components/home/ContentRow';
import { Drama } from '@/types';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    const data = await fetchApi<{
      featured?: Drama;
      trending?: Drama[];
      popular?: Drama[];
      latest?: Drama[];
      topRated?: Drama[];
      romance?: Drama[];
      action?: Drama[];
    }>('/dramas/home', { next: { revalidate: 30 } } as any);
    return data;
  } catch (error) {
    console.error('Failed to fetch home page data from backend:', error);
    return null;
  }
}

async function getAllDramas() {
  try {
    const res = await fetchApi<{ data: Drama[] } | Drama[]>('/dramas?limit=100', { next: { revalidate: 30 } } as any);
    if (Array.isArray(res)) return res;
    return res?.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [data, allDramas] = await Promise.all([
    getHomeData(),
    getAllDramas(),
  ]);

  const featuredDrama = data?.featured || allDramas.find((d) => d.isFeatured) || allDramas[0];
  const popularDramas = (data?.popular && data.popular.length > 0) ? data.popular : allDramas;
  const trendingDramas = (data?.trending && data.trending.length > 0) ? data.trending : allDramas;
  const latestDramas = (data?.latest && data.latest.length > 0) ? data.latest : allDramas;
  const romanceDramas = (data?.romance && data.romance.length > 0) ? data.romance : allDramas.filter(d => d.genres?.some(g => g.genre?.slug === 'romance'));
  const topRatedDramas = (data?.topRated && data.topRated.length > 0) ? data.topRated : allDramas;

  if (!featuredDrama && allDramas.length === 0) {
    return (
      <div className="w-full bg-[#0E1015] min-h-screen text-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">No Dramas Available</h1>
        <p className="text-slate-400 max-w-md">Import or add dramas using the Admin Panel to display them here.</p>
      </div>
    );
  }

  const heroItems = allDramas.slice(0, 5);

  return (
    <div className="w-full bg-[#0E1015] min-h-screen text-slate-100 pb-20 space-y-2">
      {/* 1. Hero Banner Carousel */}
      {featuredDrama && <HeroBanner drama={featuredDrama} dramas={heroItems} />}

      <div className="max-w-[1700px] mx-auto space-y-4">
        {/* 2. Popular Row */}
        {popularDramas.length > 0 && (
          <div id="popular">
            <ContentRow
              title="Popular Titles"
              subtitle="ජනප්‍රියතම ආසියානු කතාමාලා (සිංහල SUB)"
              dramas={popularDramas}
              aspect="poster"
              isTop10={true}
            />
          </div>
        )}

        {/* 3. Category Tag Filter Bar */}
        <TagFilterBar />

        {/* 4. Top Picks for You Row */}
        {trendingDramas.length > 0 && (
          <div id="top-picks">
            <ContentRow
              title="Top Picks for You"
              subtitle="ඔබට පෞද්ගලිකව නිර්දේශිත කතාමාලා"
              dramas={trendingDramas}
              aspect="poster"
            />
          </div>
        )}

        {/* 5. Additional Rows */}
        {latestDramas.length > 0 && (
          <ContentRow
            title="⚡ Direct High-Speed Download (1080p / 720p / 480p)"
            subtitle="1080p, 720p සහ 480p ඍජුවම Download කරගත හැකි කතාමාලා"
            dramas={latestDramas}
            aspect="backdrop"
          />
        )}

        {romanceDramas.length > 0 && (
          <ContentRow
            title="💖 Romance & Series"
            subtitle="ආදරණීය කතාමාලා"
            dramas={romanceDramas}
            aspect="poster"
          />
        )}

        {topRatedDramas.length > 0 && (
          <ContentRow
            title="⭐ Top Rated Masterpieces"
            subtitle="ප්‍රේක්ෂක ඇගයීම් ඉහළම නාට්‍ය"
            dramas={topRatedDramas}
            aspect="poster"
          />
        )}
      </div>
    </div>
  );
}
