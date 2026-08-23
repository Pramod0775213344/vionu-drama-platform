import React from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { Genre } from '@/types';
import { Sparkles, Film } from 'lucide-react';

async function getGenres() {
  try {
    return await fetchApi<Genre[]>('/genres', { cache: 'no-store' });
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    return [];
  }
}

export default async function GenresPage() {
  const genres = await getGenres();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary-500" />
          K-Drama Categories & Genres
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Browse Korean Dramas categorized by theme, story style, and emotional experience.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {genres.map((g) => (
          <Link
            key={g.id}
            href={`/dramas?genre=${g.slug}`}
            className="glass p-6 rounded-2xl border border-white/10 hover:border-primary-500 hover:bg-surface-hover transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary-300">
              {g.name}
            </h3>
            <p className="text-xs text-slate-400">
              {g._count?.dramas || 0} Dramas Available
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
