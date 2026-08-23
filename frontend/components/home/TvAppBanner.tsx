'use client';

import React from 'react';
import { Tv, Download } from 'lucide-react';

export const TvAppBanner: React.FC = () => {
  return (
    <div className="w-full my-8 px-4 sm:px-8">
      <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-[#171A24] via-[#1F2332] to-[#141620] border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-[#00E676]/40 transition-all">
        {/* Left Side Info */}
        <div className="flex items-center gap-4 sm:gap-6 z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#00E676] to-[#00A352] flex items-center justify-center text-black font-black text-2xl tracking-tighter shadow-[0_0_20px_rgba(0,230,118,0.3)] shrink-0">
            iq
          </div>

          <div className="space-y-1">
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Enjoy the Best Experience on the <span className="text-[#00E676]">iqiyi</span> TV App
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Stream in 4K Ultra HD on Samsung TV, LG WebOS, Android TV & Apple TV with Sinhala Subtitles
            </p>
          </div>
        </div>

        {/* Right Side Action Button & App Store Badge */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-black/40 border border-slate-700/80 text-[11px] font-bold text-slate-300">
            <Tv className="w-4 h-4 text-[#00E676]" />
            <span>TV App Store</span>
          </div>

          <button
            onClick={() => alert('Download iQIYI TV App on TV App Store')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00E676] hover:bg-[#00FF87] text-black font-black text-xs shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:scale-105 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Get TV App</span>
          </button>
        </div>

        {/* Ambient Glow background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#00E676]/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
