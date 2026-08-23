'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Drama } from '@/types';
import { DramaCard } from '@/components/drama/DramaCard';
import { Bookmark, Film } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<Drama[]>('/watchlist')
      .then(setDramas)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-primary-500" />
          My Watchlist ({dramas.length})
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Your saved Korean Dramas to watch now or save for later.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : dramas.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl space-y-4">
          <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400">Browse Korean Dramas and click the Bookmark icon to save them here.</p>
          <Link
            href="/dramas"
            className="inline-block px-6 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
          >
            Explore Dramas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
          {dramas.map((drama) => (
            <DramaCard key={drama.id} drama={drama} aspect="poster" />
          ))}
        </div>
      )}
    </div>
  );
}
