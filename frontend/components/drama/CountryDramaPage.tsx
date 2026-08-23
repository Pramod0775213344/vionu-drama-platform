'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Drama } from '@/types';
import { fetchApi } from '@/lib/api';
import {
  ChevronLeft, ChevronRight, Play, Star, Filter,
  Clock, TrendingUp, Award, Sparkles, ChevronDown
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   HORIZONTAL ROW with scroll arrows (reused from trending)
───────────────────────────────────────────────────── */
function DramaRow({
  title,
  icon,
  dramas,
  accent = '#00E676',
}: {
  title: string;
  icon?: React.ReactNode;
  dramas: Drama[];
  accent?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const sync = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    return () => el.removeEventListener('scroll', sync);
  }, [dramas]);

  const scroll = (d: 'left' | 'right') => {
    rowRef.current?.scrollBy({ left: d === 'left' ? -500 : 500, behavior: 'smooth' });
    setTimeout(sync, 450);
  };

  if (!dramas.length) return null;

  return (
    <div className="py-5">
      {/* Row Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-14 mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm sm:text-base font-extrabold text-white">{title}</h2>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
        <span className="text-[11px] text-slate-500 font-semibold">{dramas.length} titles</span>
      </div>

      {/* Scrollable strip */}
      <div className="relative group/strip">
        {canLeft && (
          <button onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center
                       bg-gradient-to-r from-[#0a0c10] to-transparent
                       opacity-0 group-hover/strip:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-black/70 border border-slate-700 flex items-center justify-center hover:border-[#00E676]/60 transition-colors">
              <ChevronLeft className="w-4 h-4 text-white" />
            </div>
          </button>
        )}

        <div ref={rowRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 sm:px-8 lg:px-14 pb-3
                     [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {dramas.map((drama, i) => (
            <PosterCard key={drama.id} drama={drama} rank={i + 1} accent={accent} />
          ))}
        </div>

        {canRight && dramas.length > 5 && (
          <button onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center
                       bg-gradient-to-l from-[#0a0c10] to-transparent
                       opacity-0 group-hover/strip:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-black/70 border border-slate-700 flex items-center justify-center hover:border-[#00E676]/60 transition-colors">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   POSTER CARD
───────────────────────────────────────────────────── */
function PosterCard({ drama, rank, accent }: { drama: Drama; rank: number; accent: string }) {
  const isTop3 = rank <= 3;
  return (
    <Link href={`/korean-dramas/${drama.slug}`}
      className="group relative shrink-0 w-[130px] sm:w-[150px] flex flex-col">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#181B26] border border-[#1e2130] group-hover:border-[#00E676]/30 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={drama.posterUrl} alt={drama.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />

        {/* Rank badge */}
        <div className={`absolute top-0 left-0 text-[9px] font-black px-1.5 py-0.5 z-10
          ${isTop3 ? 'bg-[#00E676] text-black' : 'bg-black/70 text-[#00E676] border-r border-b border-[#00E676]/30'}`}>
          TOP {rank}
        </div>

        {/* Country badge */}
        <div className="absolute top-1 right-1 z-10">
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-black/70 text-slate-200 backdrop-blur-sm border border-white/10">
            {drama.country === 'CHINA' ? '🇨🇳 C-Drama' : '🇰🇷 K-Drama'}
          </span>
        </div>

        {/* Play on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: accent }}>
            <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
          </div>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 z-10">
          <div className="flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-[#00E676] text-[#00E676]" />
            <span className="text-[9px] font-bold text-[#00E676]">{drama.averageRating.toFixed(1)}</span>
            <span className="text-[9px] text-slate-400 ml-auto">{drama.totalEpisodes} Eps</span>
          </div>
        </div>
      </div>

      <h3 className="mt-1.5 text-[11px] font-semibold text-slate-300 group-hover:text-[#00E676] transition-colors line-clamp-1 leading-snug">
        {drama.title}
      </h3>
      <p className="text-[9px] text-slate-500">{drama.releaseYear}</p>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────
   HERO BANNER
───────────────────────────────────────────────────── */
function Hero({
  drama,
  countryLabel,
  flagEmoji,
  accentColor,
  gradientFrom,
}: {
  drama: Drama;
  countryLabel: string;
  flagEmoji: string;
  accentColor: string;
  gradientFrom: string;
}) {
  const backdrop = drama.backdropUrl?.includes('image.tmdb.org')
    ? drama.backdropUrl.replace(/\/t\/p\/[^/]+\//, '/t/p/w1280/')
    : drama.backdropUrl || drama.posterUrl;

  return (
    <div className="relative w-full -mt-14 sm:-mt-16 h-[65vh] min-h-[420px] max-h-[620px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={backdrop} alt={drama.title}
        className="absolute inset-0 w-full h-full object-cover object-center" />

      {/* Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-r from-[#0a0c10] via-[#0a0c10]/65 to-transparent`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/10 to-[#0a0c10]/50" />

      {/* Accent color strip at left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }} />

      {/* Content — pt-20 so it clears the navbar */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-8 lg:px-14 pb-10">
        {/* Country pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{flagEmoji}</span>
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border text-white"
            style={{ borderColor: accentColor, backgroundColor: `${accentColor}20` }}>
            {countryLabel}
          </span>
          <span className="text-xs text-slate-400">· {drama.releaseYear} · {drama.totalEpisodes} Episodes</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-1 drop-shadow-2xl max-w-2xl">
          {drama.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed line-clamp-2 mb-5">
          {drama.description}
        </p>

        <div className="flex items-center gap-3">
          <Link href={`/korean-dramas/${drama.slug}`}
            className="inline-flex items-center gap-2 text-black text-sm font-extrabold px-6 py-2.5 rounded-full hover:brightness-110 transition-all shadow-lg"
            style={{ backgroundColor: accentColor }}>
            <Play className="w-4 h-4 fill-black" /> Watch Now
          </Link>
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
            <Star className="w-3.5 h-3.5 fill-[#00E676] text-[#00E676]" />
            <span className="text-sm font-extrabold text-white">{drama.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   FULL GRID (bottom section)
───────────────────────────────────────────────────── */
function FullGrid({ dramas, accent }: { dramas: Drama[]; accent: string }) {
  const [show, setShow] = useState(18);

  return (
    <div className="px-4 sm:px-8 lg:px-14 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4" style={{ color: accent }} />
        <h2 className="text-base font-extrabold text-white">All Titles</h2>
        <span className="text-xs text-slate-500">({dramas.length})</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
        {dramas.slice(0, show).map((drama, i) => (
          <Link key={drama.id} href={`/korean-dramas/${drama.slug}`} className="group relative">
            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#181B26]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drama.posterUrl} alt={drama.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg" />
              <div className="absolute top-0 left-0 text-[8px] font-black px-1.5 py-0.5"
                style={{ backgroundColor: accent, color: '#000' }}>
                #{i + 1}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 fill-white text-white drop-shadow-xl" />
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 group-hover:text-[#00E676] line-clamp-1 font-medium transition-colors">
              {drama.title}
            </p>
          </Link>
        ))}
      </div>

      {show < dramas.length && (
        <button onClick={() => setShow(s => s + 18)}
          className="mt-6 flex items-center gap-2 mx-auto px-8 py-2.5 rounded-full border text-sm font-bold transition-colors hover:text-black"
          style={{ borderColor: accent, color: accent, backgroundColor: `${accent}10` }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = accent; (e.currentTarget as HTMLElement).style.color = '#000'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}10`; (e.currentTarget as HTMLElement).style.color = accent; }}>
          <ChevronDown className="w-4 h-4" /> Show More ({dramas.length - show} remaining)
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN SHARED PAGE COMPONENT
───────────────────────────────────────────────────── */
export interface CountryDramaPageProps {
  country: 'KOREA' | 'CHINA';
}

export function CountryDramaPage({ country }: CountryDramaPageProps) {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  const isKorea = country === 'KOREA';
  const accentColor = isKorea ? '#00E676' : '#FF6B35';
  const flagEmoji = isKorea ? '🇰🇷' : '🇨🇳';
  const countryLabel = isKorea ? 'Korean Drama' : 'Chinese Drama';
  const pageTitle = isKorea ? 'K-Drama' : 'C-Drama';

  useEffect(() => {
    fetchApi<{ data: Drama[] }>(`/dramas?country=${country}&limit=100`)
      .then(res => {
        // Always filter client-side as a safety-net
        const all = res.data || [];
        const filtered = all.filter(d => d.country === country);
        setDramas(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [country]);

  const byRating = [...dramas].sort((a, b) => b.ratingCount - a.ratingCount);
  const byScore = [...dramas].sort((a, b) => b.averageRating - a.averageRating);
  const byYear = [...dramas].sort((a, b) => b.releaseYear - a.releaseYear);
  const completed = dramas.filter(d => d.status === 'COMPLETED');
  const topDrama = byRating[0];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0a0c10] pt-16">
        <div className="w-full h-[55vh] bg-[#181B26] animate-pulse" />
        <div className="px-4 sm:px-8 lg:px-14 mt-8 space-y-8">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-4 w-36 bg-[#181B26] rounded animate-pulse mb-4" />
              <div className="flex gap-3">
                {[...Array(6)].map((_, j) => (
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
    <div className="w-full min-h-screen text-slate-100" style={{ backgroundColor: '#0a0c10' }}>

      {/* ── HERO ── */}
      {topDrama && (
        <Hero
          drama={topDrama}
          countryLabel={countryLabel}
          flagEmoji={flagEmoji}
          accentColor={accentColor}
          gradientFrom="#0a0c10"
        />
      )}

      {/* ── PAGE HEADER ── */}
      <div className="px-4 sm:px-8 lg:px-14 pt-6 pb-1 flex items-center gap-3 border-b border-slate-800/60">
        <span className="text-xl">{flagEmoji}</span>
        <h1 className="text-lg font-black text-white">{pageTitle} <span className="font-light text-slate-400">— Full Library</span></h1>
        <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full border"
          style={{ color: accentColor, borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}>
          {dramas.length} Titles Available
        </span>
      </div>

      {/* ── ROW: Most Popular ── */}
      <DramaRow
        title="Most Popular"
        icon={<TrendingUp className="w-4 h-4" style={{ color: accentColor }} />}
        dramas={byRating}
        accent={accentColor}
      />

      {/* ── ROW: Highest Rated ── */}
      <DramaRow
        title="Highest Rated"
        icon={<Award className="w-4 h-4" style={{ color: accentColor }} />}
        dramas={byScore}
        accent={accentColor}
      />

      {/* ── ROW: Latest Releases ── */}
      <DramaRow
        title="Latest Releases"
        icon={<Clock className="w-4 h-4" style={{ color: accentColor }} />}
        dramas={byYear}
        accent={accentColor}
      />

      {/* ── ROW: Completed Only ── */}
      {completed.length > 0 && (
        <DramaRow
          title="Completed Series"
          icon={<Filter className="w-4 h-4" style={{ color: accentColor }} />}
          dramas={completed}
          accent={accentColor}
        />
      )}

      {/* ── FULL GRID ── */}
      <FullGrid dramas={byRating} accent={accentColor} />
    </div>
  );
}
