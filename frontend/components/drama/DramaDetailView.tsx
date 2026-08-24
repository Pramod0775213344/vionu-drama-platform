'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Share2, Download, Bookmark, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Drama } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';

interface DramaDetailViewProps {
  drama: Drama;
}

export const DramaDetailView: React.FC<DramaDetailViewProps> = ({ drama }) => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'episodes' | 'highlights' | 'cast' | 'recommended'>('episodes');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const season1 = drama.seasons?.[0];
  const episodes = season1?.episodes || [];
  const firstEpisodeId = episodes[0]?.id;
  const isCdrama = drama.country === 'CHINA' || drama.title.toLowerCase().includes('chinese') || drama.slug.includes('chinese');

  const genresList = drama.genres?.map((g) => g.genre?.name).filter(Boolean) || [
    isCdrama ? 'Chinese Mainland' : 'South Korea',
    'Romance',
    'Drama',
    'Subtitled',
  ];

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to add dramas to your watchlist.');
      return;
    }

    try {
      setIsToggling(true);
      const res = await fetchApi<{ added: boolean }>(`/watchlist/${drama.id}/toggle`, {
        method: 'POST',
      });
      setInWatchlist(res.added);
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: drama.title,
        text: `Watch ${drama.title} on Vionu!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Page link copied to clipboard!');
    }
  };

  /**
   * Build the best possible wide landscape URL for the hero banner.
   * - If backdropUrl is set and already a TMDB URL, upgrade its size to w1280.
   * - If backdropUrl contains an invalid TMDB size string, fix it.
   * - If no valid backdrop exists, derive one by swapping the poster's /w500 path prefix to /w1280.
   */
  const getBackdropUrl = (): string => {
    const fixTmdbSize = (url: string): string =>
      url
        .replace(/\/t\/p\/[^/]+\//, '/t/p/w1280/')  // replace any TMDB size with w1280
        .replace(/w\d+_and_h\d+[^/]*\//g, 'w1280/'); // extra guard for multi-face sizes

    if (drama.backdropUrl && drama.backdropUrl.includes('image.tmdb.org')) {
      return fixTmdbSize(drama.backdropUrl);
    }
    // Fallback: swap posterUrl size (portrait) prefix to w1280 — still better than nothing
    if (drama.posterUrl && drama.posterUrl.includes('image.tmdb.org')) {
      // Extract the file path after the size segment, e.g. /adcdNzLJ.jpg
      const match = drama.posterUrl.match(/\/t\/p\/[^/]+(\/.*$)/);
      if (match) {
        return `https://image.tmdb.org/t/p/w1280${match[1]}`;
      }
    }
    return drama.backdropUrl || drama.posterUrl;
  };

  const backdropSrc = getBackdropUrl();

  return (
    <div className="w-full bg-[#0E1015] min-h-screen text-slate-100 pb-20">
      {/* 1. Hero Backdrop Banner Section */}
      <div className="relative w-full -mt-14 sm:-mt-16 h-[80vh] min-h-[580px] max-h-[760px] overflow-hidden bg-[#0E1015]">
        {/* Backdrop Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backdropSrc}
          alt={drama.title}
          onError={(e) => {
            // On error: try the raw backdropUrl, then fall back to a known TMDB backdrop
            const fallbacks = [
              drama.backdropUrl,
              drama.posterUrl
                ? `https://image.tmdb.org/t/p/w1280${drama.posterUrl.match(/\/t\/p\/[^/]+(\/.*$)/)?.[1] || ''}`
                : null,
              'https://image.tmdb.org/t/p/w1280/vbkpl0ps4s5tMTUnC7SFXNzWmVr.jpg',
            ].filter(Boolean) as string[];
            const next = fallbacks.find(f => f !== e.currentTarget.src);
            if (next) e.currentTarget.src = next;
          }}
          className="w-full h-full object-cover object-center md:object-[80%_20%] filter brightness-95"
        />

        {/* Gradient Vignette Overlays (Matching Screenshot 1) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E1015] via-[#0E1015]/85 to-transparent w-full md:w-3/5 z-10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0E1015] via-[#0E1015]/70 to-transparent z-10" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0E1015]/60 to-transparent z-10" />

        {/* Left Hero Details Layer (Matching Screenshot 1) */}
        <div className="absolute bottom-6 left-0 right-0 px-6 sm:px-14 lg:px-20 max-w-4xl space-y-3.5 z-20">
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {drama.title}
          </h1>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
            <span className="px-2 py-0.5 rounded bg-[#00E676] text-black tracking-wide shadow">
              TOP 2
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#2A2E3D] text-slate-200 border border-slate-700">
              Hot Dramas
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#00E676]/20 border border-[#00E676]/60 text-[#00E676]">
              {isCdrama ? 'C-Drama' : 'K-Drama'}
            </span>
          </div>

          {/* Info Line: ★ 9.8 | 13+ | 2026 | 28 Episodes */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-bold">
            <span className="text-[#00E676] font-black flex items-center gap-1">
              ★ {drama.averageRating ? drama.averageRating.toFixed(1) : '9.8'}
            </span>
            <span className="text-slate-600">|</span>
            <span>13+</span>
            <span className="text-slate-600">|</span>
            <span>{drama.releaseYear || 2026}</span>
            <span className="text-slate-600">|</span>
            <span>{drama.totalEpisodes || episodes.length || 24} Episodes (සිංහල SUB)</span>
          </div>

          {/* Category Tag Pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {genresList.map((gName, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded bg-[#1C202C]/90 text-[11px] text-slate-300 font-medium border border-white/10"
              >
                {gName}
              </span>
            ))}
          </div>

          {/* Director & Cast Info */}
          <div className="space-y-0.5 text-xs text-slate-300">
            <p><span className="text-slate-400 font-semibold">Director:</span> {drama.director || 'Yik Chun Go'}</p>
            <p className="line-clamp-1">
              <span className="text-slate-400 font-semibold">Cast:</span> {drama.actors && drama.actors.length > 0 ? drama.actors.map(a => a.actor.name).join(', ') : 'Ai Mi, Hou Minghao, Neo, Ma Qiuyuan, Liu Lingzi, Merxat'}
            </p>
          </div>

          {/* Synopsis Paragraph with Collapse Toggle (Screenshot 1) */}
          <div className="relative">
            <p className={`text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
              <span className="text-slate-400 font-semibold">Description: </span>
              {drama.description}
            </p>
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-xs text-[#00E676] font-bold inline-flex items-center gap-0.5 ml-1 hover:underline"
            >
              {isDescriptionExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
            </button>
          </div>

          {/* Action Buttons Row (Screenshot 1) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* ▶ Play Button */}
            <Link
              href={firstEpisodeId ? `/watch/${drama.slug}/${firstEpisodeId}` : '#episodes'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00E676] hover:bg-[#00FF87] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black" />
              Play
            </Link>

            {/* Glass Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>

            {/* Glass APP Button */}
            <button
              onClick={() => alert('App download starting... Direct 1080p links ready!')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              APP
            </button>

            {/* Glass Watch Later (Watchlist) Button */}
            <button
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                inWatchlist
                  ? 'bg-[#00E676] text-black border-[#00E676]'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
              }`}
            >
              {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {inWatchlist ? 'Saved' : 'Watch Later'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Tab Navigation & Episodes Grid (Screenshots 1 & 2) */}
      <div className="max-w-[1700px] mx-auto px-6 sm:px-14 lg:px-20 mt-6 space-y-6">
        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-800 text-sm font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'episodes' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Episodes
            {activeTab === 'episodes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E676] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('highlights')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'highlights' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Highlights
            {activeTab === 'highlights' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E676] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cast')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'cast' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Cast
            {activeTab === 'cast' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E676] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recommended')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'recommended' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Recommended
            {activeTab === 'recommended' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E676] rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: EPISODES GRID (Screenshot 1 & 2 - 6 columns landscape video thumbnails) */}
        {activeTab === 'episodes' && (
          <div id="episodes" className="space-y-4">
            {/* Episode Range Dropdown Selector (Screenshot 1) */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <select className="bg-[#181B26] border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-[#00E676] cursor-pointer">
                  <option>Watch List 1-{episodes.length || 24}</option>
                  <option>Episodes 1-12</option>
                  <option>Episodes 13-24</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 6 Columns Episode Thumbnail Grid (Exact Layout from Screenshots 1 & 2) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/watch/${drama.slug}/${ep.id}`}
                    className="group flex flex-col space-y-1.5 cursor-pointer"
                  >
                    {/* Landscape Video Thumbnail Box (16:9 Aspect Ratio) */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-[#181B26] border border-slate-800 group-hover:border-[#00E676]/70 shadow-md transition-all">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(ep.thumbnailUrl || drama.backdropUrl || drama.posterUrl || '').replace('w1284_and_h721_multi_faces', 'w780')}
                        alt={`Episode ${ep.episodeNumber}`}
                        onError={(e) => {
                          e.currentTarget.src = (drama.backdropUrl || drama.posterUrl || '').replace('w1284_and_h721_multi_faces', 'w780');
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Play Hover Icon Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-[#00E676] flex items-center justify-center shadow-[0_0_15px_#00E676]">
                          <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
                        </div>
                      </div>

                      {/* Bottom Sinhala Sub Badge */}
                      <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] font-bold text-white">
                        සිංහල SUB
                      </div>
                    </div>

                    {/* Episode Title Below Thumbnail */}
                    <h4 className="text-xs font-semibold text-slate-300 group-hover:text-[#00E676] line-clamp-1 transition-colors">
                      {drama.title} Episode {ep.episodeNumber}
                    </h4>
                  </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: HIGHLIGHTS */}
        {activeTab === 'highlights' && (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <p className="text-sm font-semibold">Behind the scenes & clip highlights for {drama.title}</p>
            <p className="text-xs text-slate-500">Stream high-definition trailers and OST music videos.</p>
          </div>
        )}

        {/* Tab 3: CAST */}
        {activeTab === 'cast' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 py-4">
            {drama.actors && drama.actors.length > 0 ? (
              drama.actors.map((item) => (
                <div key={item.actor.id} className="bg-[#181B26] p-3 rounded-xl border border-slate-800 text-center space-y-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.actor.photoUrl} alt={item.actor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.actor.name}</h5>
                    <p className="text-[10px] text-slate-400">as {item.characterName}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-full py-4 text-center">Cast information loaded automatically.</p>
            )}
          </div>
        )}

        {/* Tab 4: RECOMMENDED */}
        {activeTab === 'recommended' && (
          <div className="py-4">
            <p className="text-sm text-slate-300 font-semibold mb-4">Recommended Dramas You Might Like:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {/* Sample recommended cards */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-[#181B26] border border-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
