'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Drama } from '@/types';
import { fetchApi } from '@/lib/api';
import { ChevronLeft, ChevronRight, Play, TrendingUp, Star, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────
   RANKED ROW — iQIYI "High Popularity" style
───────────────────────────────────────────────── */
function RankedDramaRow({
  title,
  subtitle,
  dramas,
  badgeLabel,
}: {
  title: string;
  subtitle?: string;
  dramas: Drama[];
  badgeLabel?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -520 : 520, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [dramas]);

  return (
    <section className="w-full py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-slate-400 font-medium">{subtitle}</span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
        {badgeLabel && (
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Scrollable Row + Arrow Buttons */}
      <div className="relative group/row">
        {/* LEFT ARROW */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center
                       bg-gradient-to-r from-[#0E1015] to-transparent
                       opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-black/70 border border-slate-700 flex items-center justify-center hover:border-[#00E676] hover:bg-[#00E676]/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        {/* CARDS STRIP */}
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-3
                     px-4 sm:px-8 lg:px-12
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {dramas.map((drama, idx) => (
            <RankedCard key={drama.id} drama={drama} rank={idx + 1} />
          ))}
        </div>

        {/* RIGHT ARROW */}
        {canScrollRight && dramas.length > 5 && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center
                       bg-gradient-to-l from-[#0E1015] to-transparent
                       opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-black/70 border border-slate-700 flex items-center justify-center hover:border-[#00E676] hover:bg-[#00E676]/20 transition-all">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────
   INDIVIDUAL RANKED CARD
───────────────────────────────────────────────── */
function RankedCard({ drama, rank }: { drama: Drama; rank: number }) {
  const isCdrama = drama.country === 'CHINA';
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/korean-dramas/${drama.slug}`}
      className="group relative shrink-0 w-[140px] sm:w-[160px] flex flex-col"
    >
      {/* POSTER */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#181B26]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={drama.posterUrl}
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

        {/* TOP badge - top left corner */}
        <div className={`absolute top-0 left-0 px-2 py-1 text-[9px] font-black uppercase tracking-wider z-10
          ${isTop3
            ? 'bg-[#00E676] text-black'
            : 'bg-black/70 text-[#00E676] border-r border-b border-[#00E676]/40'
          }`}
        >
          TOP {rank}
        </div>

        {/* Badge top right: Original / Vionu Only */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded
            ${isCdrama
              ? 'bg-[#00C853]/90 text-white'
              : 'bg-[#0091EA]/90 text-white'
            }`}
          >
            {isCdrama ? 'Original' : 'Vionu Only'}
          </span>
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-11 h-11 rounded-full bg-[#00E676]/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 fill-black text-black translate-x-0.5" />
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Episode / status info at bottom */}
        <div className="absolute bottom-1.5 left-2 right-2 z-10">
          <p className="text-[9px] text-slate-300 font-semibold">
            {drama.status === 'ONGOING'
              ? `Updated to ${Math.min(8, drama.totalEpisodes)}`
              : `${drama.totalEpisodes} Episodes`}
          </p>
        </div>
      </div>

      {/* TITLE below card */}
      <div className="mt-2 px-0.5">
        <h3 className="text-xs font-semibold text-slate-200 group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug">
          {drama.title}
        </h3>
        {drama.hasSinhalaSub && (
          <span className="text-[9px] text-[#00E676] font-bold mt-0.5 block">සිංහල SUB</span>
        )}
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────
   FEATURED BANNER — large hero strip at top
───────────────────────────────────────────────── */
function TrendingHero({ drama }: { drama: Drama }) {
  const backdrop = drama.backdropUrl?.includes('image.tmdb.org')
    ? drama.backdropUrl.replace(/\/t\/p\/[^/]+\//, '/t/p/w1280/')
    : drama.backdropUrl;

  return (
    <div className="relative w-full -mt-14 sm:-mt-16 h-[62vh] min-h-[400px] max-h-[600px] overflow-hidden bg-[#0E1015]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backdrop}
        alt={drama.title}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E1015] via-[#0E1015]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1015] via-transparent to-[#0E1015]/50" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 lg:px-12 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-[#00E676] text-black text-[10px] font-black px-2 py-0.5 rounded">
            #1 Trending
          </span>
          <span className="text-xs text-slate-300 font-semibold">{drama.releaseYear}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-300">{drama.totalEpisodes} Episodes</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-2xl mb-1">
          {drama.title}
        </h1>
        <p className="text-xs text-slate-300 max-w-md leading-relaxed line-clamp-2 mb-4">
          {drama.description}
        </p>
        <Link
          href={`/korean-dramas/${drama.slug}`}
          className="inline-flex items-center gap-2 bg-[#00E676] text-black text-sm font-extrabold px-5 py-2.5 rounded-full hover:bg-[#00FF87] transition-colors w-fit shadow-lg"
        >
          <Play className="w-4 h-4 fill-black" /> Watch Now
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function TrendingPage() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ data: Drama[] }>('/dramas')
      .then((res) => {
        setDramas(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const kdramas = dramas.filter(d => d.country === 'KOREA');
  const cdramas = dramas.filter(d => d.country === 'CHINA');
  const allSorted = [...dramas].sort((a, b) => b.ratingCount - a.ratingCount);
  const topDrama = allSorted[0];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0E1015] pt-20">
        {/* Skeleton hero */}
        <div className="w-full h-[42vh] bg-[#181B26] animate-pulse" />
        <div className="px-4 sm:px-8 lg:px-12 mt-8 space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-4 w-40 bg-[#181B26] rounded animate-pulse mb-4" />
              <div className="flex gap-3">
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="w-[140px] shrink-0 aspect-[2/3] rounded-lg bg-[#181B26] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0E1015] text-slate-100 pb-24">

      {/* ── HERO ── */}
      {topDrama && <TrendingHero drama={topDrama} />}

      {/* ── PAGE TITLE ── */}
      <div className="px-4 sm:px-8 lg:px-12 pt-8 pb-2 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-[#00E676]" />
        <h2 className="text-xl font-black text-white tracking-tight">Trending Now</h2>
        <span className="text-xs text-slate-400 font-medium ml-1">Updated Today</span>
      </div>

      {/* ── HIGH POPULARITY (all by rating count) ── */}
      <RankedDramaRow
        title="High Popularity"
        dramas={allSorted}
        badgeLabel="All"
      />

      {/* ── K-DRAMA HOT LIST ── */}
      {kdramas.length > 0 && (
        <RankedDramaRow
          title="🇰🇷 K-Drama Hot List"
          subtitle="Korean Dramas"
          dramas={kdramas}
        />
      )}

      {/* ── C-DRAMA HOT LIST ── */}
      {cdramas.length > 0 && (
        <RankedDramaRow
          title="🇨🇳 C-Drama Hot List"
          subtitle="Chinese Dramas"
          dramas={cdramas}
        />
      )}

      {/* ── MOST ANTICIPATED (featured dramas) ── */}
      {dramas.filter(d => d.isFeatured).length > 0 && (
        <RankedDramaRow
          title="Most Anticipated"
          subtitle="Featured Picks"
          dramas={dramas.filter(d => d.isFeatured)}
        />
      )}

      {/* ── HIGHEST RATED ── */}
      <RankedDramaRow
        title="Highest Rated"
        subtitle="By User Score"
        dramas={[...dramas].sort((a, b) => b.averageRating - a.averageRating)}
      />

      {/* ── RECENTLY UPDATED (all by newest year) ── */}
      <RankedDramaRow
        title="Recently Released"
        subtitle={String(new Date().getFullYear())}
        dramas={[...dramas].sort((a, b) => b.releaseYear - a.releaseYear)}
      />

      {/* ── FULL CATALOGUE GRID at bottom ── */}
      <div className="px-4 sm:px-8 lg:px-12 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#00E676]" />
          <h2 className="text-base font-extrabold text-white">Full Catalogue</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
          {dramas.map((drama, idx) => (
            <Link
              key={drama.id}
              href={`/korean-dramas/${drama.slug}`}
              className="group relative"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#181B26]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={drama.posterUrl}
                  alt={drama.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg" />
                <div className="absolute top-0 left-0 bg-[#00E676] text-black text-[8px] font-black px-1.5 py-0.5 rounded-br">
                  #{idx + 1}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 fill-white text-white drop-shadow-xl" />
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 group-hover:text-[#00E676] transition-colors line-clamp-1 font-medium">
                {drama.title}
              </p>
              <p className="text-[9px] text-slate-600">{drama.totalEpisodes} Eps</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
