'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { WatchHistoryItem } from '@/types';
import { History, Play } from 'lucide-react';

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<WatchHistoryItem[]>('/history')
      .then(setHistory)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatPercent = (progress: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min(Math.round((progress / total) * 100), 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-primary-500" />
          Watch History & Resume ({history.length})
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Track your watching progress and seamlessly pick up where you left off.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl space-y-4">
          <History className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Watch History Found</h3>
          <p className="text-xs text-slate-400">Start watching an episode to track your progress automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const percent = formatPercent(item.progressSeconds, item.totalSeconds);
            return (
              <div
                key={item.id}
                className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary-500/40 transition-all"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-surface shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.episode?.thumbnailUrl || item.drama?.backdropUrl}
                      alt={item.drama?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-bold text-primary-400">
                      {item.drama?.title}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate">
                      Ep. {item.episode?.episodeNumber}: {item.episode?.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{percent}% Completed</span>
                      <span>•</span>
                      <span>
                        {Math.floor(item.progressSeconds / 60)} / {Math.floor(item.totalSeconds / 60)} min
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/watch/${item.drama?.slug}/${item.episodeId}`}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shrink-0 shadow-lg shadow-primary-600/30"
                >
                  Resume Episode
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
