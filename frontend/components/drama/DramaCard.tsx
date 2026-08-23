'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Bookmark, Check, Download } from 'lucide-react';
import { Drama } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';

interface DramaCardProps {
  drama: Drama;
  aspect?: 'poster' | 'backdrop';
  rank?: number;
}

export const DramaCard: React.FC<DramaCardProps> = ({ drama, aspect = 'poster', rank }) => {
  const { isAuthenticated } = useAuthStore();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Determine top badge text based on drama fields
  const topLeftTag = drama.isFeatured
    ? 'iQIYI Only'
    : drama.country === 'CHINA'
    ? 'Original'
    : 'Playlist';

  const episodeText = drama.totalEpisodes
    ? `${drama.totalEpisodes} Episodes`
    : drama.status === 'ONGOING'
    ? 'New Episode'
    : 'Full Series';

  return (
    <Link href={`/korean-dramas/${drama.slug}`} className="group block relative shrink-0">
      <div className="flex items-end gap-1 sm:gap-2">
        {/* iQIYI Giant Rank Number Overlay for Top 10 lists */}
        {rank !== undefined && (
          <span className="iq-rank-num -mr-5 z-10 select-none pointer-events-none drop-shadow-2xl">
            {rank}
          </span>
        )}

        <div
          className={`relative overflow-hidden rounded-lg bg-[#181B26] border border-slate-800 group-hover:border-[#00E676]/80 shadow-md group-hover:shadow-[0_0_20px_rgba(0,230,118,0.25)] transition-all duration-300 transform group-hover:-translate-y-1.5 ${
            aspect === 'poster'
              ? 'aspect-[2/3] w-36 sm:w-48 lg:w-52'
              : 'aspect-video w-64 sm:w-72 lg:w-80'
          }`}
        >
          {/* Poster / Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aspect === 'poster' ? drama.posterUrl : drama.backdropUrl || drama.posterUrl}
            alt={drama.title}
            onError={(e) => {
              if (drama.posterUrl && e.currentTarget.src !== drama.posterUrl) {
                e.currentTarget.src = drama.posterUrl;
              } else {
                e.currentTarget.src = 'https://image.tmdb.org/t/p/w500/adcdNzLJ8LOjWJjNFrapXGzFco3.jpg';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />


          {/* iQIYI Corner Badges (Matching Screenshot 1 & 2) */}
          <div className="absolute top-1 left-1 right-1 flex items-center justify-between pointer-events-none z-10">
            {/* Top Left: iQIYI Only / Original Tag */}
            <span className="px-1.5 py-0.5 rounded bg-[#00E676] text-black text-[9px] font-black tracking-tight shadow">
              {topLeftTag}
            </span>

            {/* Top Right: Bright Green TOP 10 Tag */}
            <span className="px-1.5 py-0.5 rounded bg-[#00E676] text-black text-[9px] font-black tracking-tighter shadow">
              TOP 10
            </span>
          </div>

          {/* Bottom Episode Overlay Bar (Matching Screenshot 1 & 2) */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-2 pt-6 flex items-end justify-between text-[10px] font-bold text-slate-200 z-10">
            <span className="text-white drop-shadow-md truncate max-w-[70%]">
              {episodeText}
            </span>
            <span className="text-black bg-[#00E676] px-1 py-0.2 rounded text-[8px] font-black shrink-0">
              සිංහල SUB
            </span>
          </div>

          {/* Hover Quick Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end z-20">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleWatchlistToggle}
                disabled={isToggling}
                className={`p-2 rounded-full border transition-all ${
                  inWatchlist
                    ? 'bg-[#00E676] text-black border-[#00E676]'
                    : 'bg-white/20 text-slate-200 border-white/30 hover:border-[#00E676] hover:text-[#00E676]'
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>

              <span className="p-2 rounded-full bg-[#00E676] text-black font-black shadow-[0_0_15px_#00E676] flex-1 flex items-center justify-center gap-1.5 text-xs hover:bg-[#00FF87] transition-all">
                <Play className="w-3.5 h-3.5 fill-black" />
                Stream
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold">
              <span>{drama.releaseYear || '2026'}</span>
              <span className="flex items-center gap-1 text-[#00E676] font-bold">
                <Download className="w-3 h-3" /> 1080p
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Title Below Poster (Matching Screenshot 1 & 2) */}
      <div className="mt-2 space-y-0.5 max-w-[9rem] sm:max-w-[12rem] lg:max-w-[13rem]">
        <h3 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-[#00E676] transition-colors line-clamp-1">
          {drama.title}
        </h3>
      </div>
    </Link>
  );
};

