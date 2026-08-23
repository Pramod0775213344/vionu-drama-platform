import React from 'react';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Actor } from '@/types';
import { DramaCard } from '@/components/drama/DramaCard';
import { User as UserIcon, Calendar, Film } from 'lucide-react';

async function getActor(id: string): Promise<Actor | null> {
  try {
    return await fetchApi<Actor>(`/actors/${id}`, { cache: 'no-store' });
  } catch (error) {
    console.error(`Failed to fetch actor ${id}:`, error);
    return null;
  }
}

export default async function ActorPage({ params }: { params: { id: string } }) {
  const actor = await getActor(params.id);

  if (!actor) {
    notFound();
  }

  const filmography = actor.dramas?.map((d) => d.drama) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Actor Header Card */}
      <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-primary-500/40 shadow-2xl shrink-0 bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={actor.photoUrl} alt={actor.name} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-4 text-center md:text-left flex-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{actor.name}</h1>
            <p className="text-base text-primary-300 font-medium">{actor.originalName}</p>
          </div>

          {actor.birthDate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg glass text-xs text-slate-300 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-primary-400" />
              <span>Born: {actor.birthDate}</span>
            </div>
          )}

          {actor.bio && (
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {actor.bio}
            </p>
          )}
        </div>
      </div>

      {/* Filmography Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white border-b border-border pb-2 flex items-center gap-2">
          <Film className="w-6 h-6 text-primary-500" />
          K-Drama Filmography ({filmography.length})
        </h2>

        {filmography.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {filmography.map((drama) => (
              <DramaCard key={drama.id} drama={drama} aspect="poster" />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No associated dramas listed yet.</p>
        )}
      </div>
    </div>
  );
}
