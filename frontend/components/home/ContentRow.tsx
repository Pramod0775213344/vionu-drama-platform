'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DramaCard } from '@/components/drama/DramaCard';
import { Drama } from '@/types';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  dramas: Drama[];
  aspect?: 'poster' | 'backdrop';
  isTop10?: boolean;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  dramas,
  aspect = 'poster',
  isTop10 = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!dramas || dramas.length === 0) return null;

  return (
    <div className="space-y-3 my-8 relative group/row px-4 sm:px-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>

      {/* Row Wrapper with arrows */}
      <div className="relative">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#181B26]/90 border border-slate-700 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover/row:opacity-100 transition-all hover:bg-[#00E676] hover:text-black hover:border-[#00E676]"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Horizontal Container */}
        <div
          ref={rowRef}
          className={`scroll-horizontal flex items-center py-2 overflow-x-auto scrollbar-none ${
            isTop10 ? 'gap-6 sm:gap-8' : 'gap-4 sm:gap-5'
          }`}
        >
          {dramas.map((drama, idx) => (
            <DramaCard
              key={drama.id}
              drama={drama}
              aspect={aspect}
              rank={isTop10 ? idx + 1 : undefined}
            />
          ))}
        </div>

        {/* Scroll Right Chevron Arrow Button (Matching Screenshot 1 & 2) */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#181B26]/90 border border-slate-700 text-white flex items-center justify-center shadow-2xl opacity-90 group-hover/row:opacity-100 transition-all hover:bg-[#00E676] hover:text-black hover:border-[#00E676]"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

