'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Drama, Actor, Genre } from '@/types';
import { DramaCard } from '@/components/drama/DramaCard';
import { Search, Sparkles, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{
    dramas: Drama[];
    actors: Actor[];
    genres: Genre[];
  }>({ dramas: [], actors: [], genres: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ dramas: [], actors: [], genres: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetchApi<{ dramas: Drama[]; actors: Actor[]; genres: Genre[] }>(
        `/search?q=${encodeURIComponent(query.trim())}`,
      )
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Search className="w-10 h-10 text-primary-500" />
          Search Vionu
        </h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by drama title, original Korean name, or actor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border-2 border-primary-500/40 text-white rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary-500 shadow-xl"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Searching Vionu database...</div>
      ) : (
        <div className="space-y-10">
          {/* Dramas */}
          {results.dramas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-border pb-2">
                Korean Dramas ({results.dramas.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
                {results.dramas.map((drama) => (
                  <DramaCard key={drama.id} drama={drama} aspect="poster" />
                ))}
              </div>
            </div>
          )}

          {/* Actors */}
          {results.actors.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white border-b border-border pb-2">
                Actors ({results.actors.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {results.actors.map((actor) => (
                  <Link
                    key={actor.id}
                    href={`/actors/${actor.id}`}
                    className="glass p-3 rounded-xl border border-white/10 hover:border-primary-500 text-center space-y-2 group transition-all"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border border-primary-500/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={actor.photoUrl} alt={actor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-primary-300">
                      {actor.name}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim() && results.dramas.length === 0 && results.actors.length === 0 && (
            <div className="text-center py-16 text-slate-400 glass rounded-2xl">
              No results found for &quot;{query}&quot;. Try searching for &quot;Romance&quot;, &quot;Queen of Tears&quot;, or &quot;Kim Soo-hyun&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
