'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { Drama } from '@/types';

interface HeroBannerProps {
  drama?: Drama;
  dramas?: Drama[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ drama, dramas = [] }) => {
  const items = dramas.length > 0 ? dramas : drama ? [drama] : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentDrama = items[currentIndex];
  const isCdrama =
    currentDrama.country === 'CHINA' ||
    currentDrama.title.toLowerCase().includes('chinese') ||
    currentDrama.slug.includes('chinese');

  const genresList = currentDrama.genres?.map((g) => g.genre?.name).filter(Boolean) || [
    'Thailand',
    'Romance',
    'Urban',
    'Thai',
    'LGBT',
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="relative w-full -mt-14 sm:-mt-16 h-[90vh] min-h-[620px] max-h-[860px] overflow-hidden bg-[#0E1015] group/hero">
      {/* Backdrop Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentDrama.backdropUrl || currentDrama.posterUrl}
        alt={currentDrama.title}
        onError={(e) => {
          if (currentDrama.posterUrl && e.currentTarget.src !== currentDrama.posterUrl) {
            e.currentTarget.src = currentDrama.posterUrl;
          } else {
            e.currentTarget.src = 'https://image.tmdb.org/t/p/w500/adcdNzLJ8LOjWJjNFrapXGzFco3.jpg';
          }
        }}
        className="w-full h-full object-cover object-center md:object-[75%_20%] filter brightness-95 transition-all duration-700"
      />

      {/* Dark Vignette Overlay Gradients (Matching Reference Screenshot) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0E1015] via-[#0E1015]/80 to-transparent w-full md:w-3/5 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0E1015] via-[#0E1015]/70 to-transparent z-10" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0E1015]/60 to-transparent z-10" />


      {/* Content Layer (Left Aligned matching Screenshot 2) */}
      <div className="absolute bottom-10 left-0 right-0 px-6 sm:px-14 lg:px-20 max-w-4xl space-y-4 z-20">
        {/* Title (Stylized Metallic/Gold Look like 'The Fire 4 Elements') */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-serif italic drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
          {currentDrama.title}
        </h1>

        {/* iQIYI Badges Row (Screenshot 2) */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold pt-1">
          <span className="px-2 py-0.5 rounded bg-[#00E676] text-black tracking-wide shadow">
            TOP 3
          </span>
          <span className="px-2.5 py-0.5 rounded bg-[#2A2E3D] text-slate-200 border border-slate-700">
            High Popularity
          </span>
          <span className="px-2.5 py-0.5 rounded bg-[#00E676]/15 border border-[#00E676]/60 text-[#00E676]">
            {isCdrama ? 'iQIYI C-Drama' : 'iQIYI Only'}
          </span>
        </div>

        {/* Info Line: ★ 9.9 | 2026 | 18+ | New Episode */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-300 font-bold">
          <span className="text-[#00E676] font-black flex items-center gap-1">
            ★ {currentDrama.averageRating ? currentDrama.averageRating.toFixed(1) : '9.9'}
          </span>
          <span className="text-slate-600">|</span>
          <span>{currentDrama.releaseYear || 2026}</span>
          <span className="text-slate-600">|</span>
          <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">18+</span>
          <span className="text-slate-600">|</span>
          <span className="text-white font-semibold">New Episode (සිංහල SUB)</span>
        </div>

        {/* Genre Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {genresList.slice(0, 5).map((genreName, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded bg-[#1C202C]/90 text-[11px] text-slate-300 font-medium hover:text-[#00E676] transition-colors cursor-pointer border border-white/5"
            >
              {genreName}
            </span>
          ))}
        </div>

        {/* Synopsis Paragraph */}
        <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 leading-relaxed max-w-2xl font-normal drop-shadow">
          {currentDrama.description}
        </p>

        {/* Action Buttons (Matching Screenshot 2) */}
        <div className="flex items-center gap-4 pt-3">
          {/* Circular Neon Green Play Button */}
          <Link
            href={`/korean-dramas/${currentDrama.slug}`}
            className="w-13 h-13 sm:w-14 sm:h-14 w-12 h-12 rounded-full bg-[#00E676] text-black shadow-[0_0_25px_rgba(0,230,118,0.5)] hover:bg-[#00FF87] hover:scale-110 transition-all flex items-center justify-center group/btn shrink-0"
            title="Watch Now"
          >
            <Play className="w-6 h-6 fill-black translate-x-0.5 group-hover/btn:scale-110 transition-transform" />
          </Link>

          {/* Circular Glass Bookmark Button */}
          <Link
            href={`/korean-dramas/${currentDrama.slug}`}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all flex items-center justify-center hover:scale-105 shrink-0"
            title="Bookmark / Download"
          >
            <Bookmark className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Left/Right Carousel Edge Arrow Controls (Screenshot 2) */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white transition-opacity hover:scale-125"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/70 hover:text-white transition-opacity hover:scale-125"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg" />
          </button>
        </>
      )}

      {/* Bottom Right Carousel Pagination Indicators (Dash + Dots matching Screenshot 2) */}
      {items.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-12 flex items-center gap-1.5 z-30">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-5 h-1.5 rounded-full bg-[#00E676] shadow-[0_0_10px_#00E676]'
                  : 'w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

