'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Film,
  Tv,
  Users,
  Clock,
  Sparkles,
  PlusCircle,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertTriangle,
  Play,
  Edit,
  Layers
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/admin/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            VIONU ADMIN CONTROL STUDIO
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard & Media Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Asian drama catalog, TMDB live sync, episode video streams, and content delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tmdb"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20"
          >
            <Search className="w-4 h-4" />
            TMDB Auto-Importer
          </Link>
          <Link
            href="/dramas/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181C26] text-slate-200 text-xs font-bold hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#00E676]" />
            New Drama
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#0E1118] border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dramas */}
          <div className="p-5 rounded-2xl bg-[#0E1118] border border-slate-800 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Total Dramas</span>
              <div className="w-8 h-8 rounded-xl bg-[#00E676]/10 flex items-center justify-center">
                <Film className="w-4 h-4 text-[#00E676]" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{data?.stats?.totalDramas || 0}</p>
            <span className="text-[10px] text-emerald-400 font-bold block">
              {data?.countryCounts?.find((c: any) => c.country === 'KOREA')?._count?.id || 0} K-Dramas ·{' '}
              {data?.countryCounts?.find((c: any) => c.country === 'CHINA')?._count?.id || 0} C-Dramas
            </span>
          </div>

          {/* Total Episodes */}
          <div className="p-5 rounded-2xl bg-[#0E1118] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Live Episodes</span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Tv className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{data?.stats?.totalEpisodes || 0}</p>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Ready for HD HLS streaming
            </span>
          </div>

          {/* Watch Time */}
          <div className="p-5 rounded-2xl bg-[#0E1118] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Stream Watch Hours</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{data?.stats?.totalWatchTimeHours || 0} hrs</p>
            <span className="text-[10px] text-emerald-400 font-semibold block">Across all episodes</span>
          </div>

          {/* Total Users */}
          <div className="p-5 rounded-2xl bg-[#0E1118] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Registered Users</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{data?.stats?.totalUsers || 0}</p>
            <span className="text-[10px] text-emerald-400 font-semibold block">Active platform viewers</span>
          </div>
        </div>
      )}

      {/* Quick Launchpad & Importer Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0E1118] to-[#0E1118] border border-[#00E676]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00E676]">
            Fast Workflow
          </span>
          <h2 className="text-lg font-black text-white">
            Upload or Import Drama in 1-Click
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Type any drama title into TMDB Live Search to automatically download TMDB backdrops, high-res posters, official synopsis, cast lists, and build all episodes instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/tmdb"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00E676] text-black text-xs font-extrabold hover:bg-[#00FF87] transition-colors shadow-lg"
          >
            <Search className="w-4 h-4" /> Open TMDB Search
          </Link>
          <Link
            href="/dramas"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#181C26] text-slate-200 text-xs font-bold hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Film className="w-4 h-4" /> View All Dramas
          </Link>
        </div>
      </div>

      {/* Recent Dramas Table */}
      <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#00E676]" />
            <h3 className="text-base font-extrabold text-white">Recently Added Dramas</h3>
          </div>
          <Link href="/dramas" className="text-xs text-[#00E676] hover:underline font-bold flex items-center gap-1">
            Manage All Catalog <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#181C26] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-semibold">Drama</th>
                  <th className="pb-3 font-semibold">Country</th>
                  <th className="pb-3 font-semibold">Episodes</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Sinhala Sub</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentDramas?.map((drama: any) => (
                  <tr key={drama.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={drama.posterUrl}
                          alt={drama.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white line-clamp-1">{drama.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {drama.releaseYear} · {drama.genres?.map((g: any) => g.genre?.name).join(', ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        drama.country === 'CHINA'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-[#00E676]/20 text-[#00E676]'
                      }`}>
                        {drama.country === 'CHINA' ? '🇨🇳 C-Drama' : '🇰🇷 K-Drama'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-300">
                      {drama._count?.episodes || drama.totalEpisodes} Episodes
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {drama.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {drama.hasSinhalaSub ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/episodes?dramaId=${drama.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#00E676] transition-colors"
                          title="Manage Episodes"
                        >
                          <Tv className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/dramas/${drama.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Drama"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
