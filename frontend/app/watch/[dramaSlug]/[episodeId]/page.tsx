import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Drama, Episode } from '@/types';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Star, MessageSquare, Bookmark, Share2, ChevronRight, Tv } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getEpisodeData(episodeId: string) {
  try {
    return await fetchApi<Episode & { drama: Drama }>(`/episodes/${episodeId}`, { cache: 'no-store' });
  } catch (error) {
    console.error('Failed to fetch episode:', error);
    return null;
  }
}

async function getTrendingDramas() {
  try {
    return await fetchApi<Drama[]>('/dramas?isTrending=true&limit=10', { cache: 'no-store' });
  } catch {
    return [];
  }
}

export default async function WatchPage({
  params,
}: {
  params: { dramaSlug: string; episodeId: string };
}) {
  const [episodeData, trendingDramas] = await Promise.all([
    getEpisodeData(params.episodeId),
    getTrendingDramas(),
  ]);

  if (!episodeData || !episodeData.drama) {
    notFound();
  }

  const { drama } = episodeData;
  const season1 = drama.seasons?.[0];
  const allEpisodes = season1?.episodes || [];
  const currentIndex = allEpisodes.findIndex((e) => e.id === episodeData.id);
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  const isCdrama = drama.country === 'CHINA';
  const genresList = drama.genres?.map(g => g.genre?.name).filter(Boolean) || [];

  return (
    <div className="w-full bg-[#0E1015] min-h-screen text-slate-100">
      <div className="max-w-[1700px] mx-auto">

        {/* ──────────────────────────────────────────────────────
            MAIN 2-COLUMN LAYOUT: Player (left) + Sidebar (right)
        ────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row">

          {/* ═══════════════════════════════
              LEFT: Video Player + Info
          ═══════════════════════════════ */}
          <div className="flex-1 min-w-0">

            {/* VIDEO PLAYER (full width of left column) */}
            <div className="w-full bg-black">
              <VideoPlayer
                episode={episodeData}
                drama={drama}
                allEpisodes={allEpisodes}
                currentIndex={currentIndex}
              />
            </div>

            {/* Below-player action bar: Comments, Watch Later, Share */}
            <div className="flex items-center gap-6 px-4 py-3 border-b border-slate-800 text-xs text-slate-400">
              <button className="flex items-center gap-1.5 hover:text-[#00E676] transition-colors font-semibold">
                <MessageSquare className="w-4 h-4" /> Comments
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#00E676] transition-colors font-semibold">
                <Bookmark className="w-4 h-4" /> Watch Later
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#00E676] transition-colors font-semibold">
                <Share2 className="w-4 h-4" /> Share
              </button>

              {/* Next episode link */}
              {nextEpisode && (
                <Link
                  href={`/watch/${drama.slug}/${nextEpisode.id}`}
                  className="ml-auto flex items-center gap-1 text-[#00E676] font-bold hover:underline"
                >
                  Next Episode <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Drama Title + Back link */}
            <div className="flex items-center gap-2 px-4 py-3">
              <Link
                href={`/korean-dramas/${drama.slug}`}
                className="text-lg sm:text-xl font-extrabold text-white hover:text-[#00E676] transition-colors flex items-center gap-1"
              >
                {drama.title} <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
            </div>

            {/* Rating Row */}
            <div className="flex items-center gap-2 px-4 pb-2">
              <Star className="w-3.5 h-3.5 fill-[#00E676] text-[#00E676]" />
              <span className="text-[#00E676] font-extrabold text-sm">{drama.averageRating.toFixed(1)}</span>
              <span className="text-slate-500 text-xs">({drama.ratingCount.toLocaleString()} ratings) · Rate now</span>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-[11px] font-black">
              <span className="px-2 py-0.5 rounded bg-[#00E676] text-black">TOP 2</span>
              <span className="px-2.5 py-0.5 rounded bg-[#2A2E3D] text-slate-200 border border-slate-700">Hot Dramas</span>
              <span className="px-2.5 py-0.5 rounded bg-[#00E676]/20 border border-[#00E676]/60 text-[#00E676]">
                {isCdrama ? 'Original' : 'K-Drama'}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C202C] text-slate-300 border border-slate-700">13+</span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C202C] text-slate-300 border border-slate-700">{drama.releaseYear}</span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C202C] text-slate-300 border border-slate-700">{drama.totalEpisodes} Episodes</span>
            </div>

            {/* Genre Pill Tags */}
            {genresList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {genresList.map((g, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded bg-[#181B26] text-[11px] text-slate-400 border border-slate-800">{g}</span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-400">Description: </span>
              {drama.description}
            </div>

            {/* Cast row (circular photos) */}
            {drama.actors && drama.actors.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {/* Director first */}
                  {drama.director && (
                    <div className="flex flex-col items-center gap-1 shrink-0 min-w-[60px]">
                      <div className="w-14 h-14 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                        <span className="text-xs text-slate-300 font-bold text-center leading-tight px-1">{drama.director.split(',')[0]}</span>
                      </div>
                      <span className="text-[9px] text-slate-300 font-semibold text-center">{drama.director.split(',')[0]}</span>
                      <span className="text-[9px] text-slate-500">Director</span>
                    </div>
                  )}
                  {drama.actors.map(item => (
                    <Link key={item.actor.id} href={`/actors/${item.actor.id}`} className="flex flex-col items-center gap-1 shrink-0 min-w-[60px] group">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-700 group-hover:border-[#00E676] transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.actor.photoUrl} alt={item.actor.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-slate-300 font-semibold text-center line-clamp-1">{item.actor.name}</span>
                      <span className="text-[9px] text-slate-500">Cast</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Dramas (horizontal scroll row) */}
            {drama.relatedDramas && drama.relatedDramas.length > 0 && (
              <div className="px-4 pb-8">
                <h3 className="text-sm font-extrabold text-white mb-3">Recommended</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {drama.relatedDramas.map(rel => (
                    <Link
                      key={rel.id}
                      href={`/korean-dramas/${rel.slug}`}
                      className="shrink-0 w-28 group"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#181B26] border border-slate-800 group-hover:border-[#00E676]/50 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={rel.posterUrl} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                          <p className="text-[9px] text-slate-300">{rel.totalEpisodes} Episodes</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 group-hover:text-[#00E676] transition-colors">{rel.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════
              RIGHT: Episode List + Top 10
          ═══════════════════════════════ */}
          <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-l border-slate-800 flex flex-col">

            {/* Sidebar Header: Drama title + Ep/Highlights tabs */}
            <div className="px-4 pt-4 pb-0 border-b border-slate-800 sticky top-14 bg-[#0E1015] z-20">
              <h2 className="text-sm font-extrabold text-white mb-3 line-clamp-1">{drama.title}</h2>
              <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                <button className="pb-2 relative text-[#00E676] border-b-2 border-[#00E676]">
                  Episodes
                </button>
                <button className="pb-2 hover:text-slate-200 transition-colors">
                  Highlights
                </button>
              </div>
            </div>

            {/* Watch List Header + Grid Icon */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-800 bg-[#0E1015]">
              <span className="text-xs font-semibold text-slate-300">Watch List 1-{allEpisodes.length}</span>
              <button className="p-1 rounded hover:bg-slate-800 transition-colors">
                <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
                  {[...Array(9)].map((_, i) => <div key={i} className="bg-slate-500 rounded-[1px]" />)}
                </div>
              </button>
            </div>

            {/* Numbered Episode Grid (matches iQIYI screenshot exactly) */}
            <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-320px)] p-3">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {allEpisodes.map((ep) => {
                  const isCurrent = ep.id === episodeData.id;
                  return (
                    <Link
                      key={ep.id}
                      href={`/watch/${drama.slug}/${ep.id}`}
                      title={`Episode ${ep.episodeNumber}`}
                      className={`relative flex items-center justify-center aspect-square rounded text-[11px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#00E676] text-black shadow-[0_0_8px_rgba(0,230,118,0.5)]'
                          : 'bg-[#1C202C] text-slate-300 hover:bg-[#00E676]/20 hover:text-[#00E676] border border-slate-800 hover:border-[#00E676]/40'
                      }`}
                    >
                      {ep.episodeNumber}
                    </Link>
                  );
                })}
              </div>

              {/* Top 10 Dramas Section */}
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-xs font-extrabold text-white mb-3 flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-[#00E676]" />
                  Top 10 Dramas
                </h3>
                <div className="space-y-3">
                  {(trendingDramas.length > 0 ? trendingDramas : [drama]).slice(0, 10).map((d, idx) => (
                    <Link
                      key={d.id}
                      href={`/korean-dramas/${d.slug}`}
                      className="flex items-center gap-2 group"
                    >
                      {/* Rank number */}
                      <span className={`text-sm font-black w-5 shrink-0 ${idx < 3 ? 'text-[#00E676]' : 'text-slate-500'}`}>
                        {idx + 1}
                      </span>
                      {/* Drama name */}
                      <span className="text-xs text-slate-300 group-hover:text-[#00E676] transition-colors line-clamp-1 font-medium">
                        {d.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
