'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Film,
  Search,
  PlusCircle,
  Tv,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
  Filter,
  Sparkles,
  RefreshCw,
  Loader2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Drama } from '@/types';

export default function DramasCatalogPage() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [sort, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Drama | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDramas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (country !== 'ALL') params.append('country', country);
      if (status !== 'ALL') params.append('status', status);
      if (sort) params.append('sort', sort);
      params.append('page', String(page));
      params.append('limit', '30');

      const res = await fetchApi<{ data: Drama[]; meta: { total: number } }>(
        `/admin/dramas?${params.toString()}`
      );
      setDramas(res.data || []);
      setTotalCount(res.meta?.total || 0);
    } catch (err) {
      console.error('Failed to load dramas:', err);
    } finally {
      setLoading(false);
    }
  }, [search, country, status, sort, page]);

  useEffect(() => {
    loadDramas();
  }, [loadDramas]);

  const handleToggle = async (dramaId: string, field: 'isFeatured' | 'isTrending' | 'hasSinhalaSub', currentValue: boolean) => {
    try {
      await fetchApi(`/admin/dramas/${dramaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: !currentValue }),
      });
      setDramas((prev) =>
        prev.map((d) => (d.id === dramaId ? { ...d, [field]: !currentValue } : d))
      );
    } catch (err) {
      console.error('Failed to update toggle:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetchApi(`/admin/dramas/${deleteTarget.id}`, { method: 'DELETE' });
      setDramas((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete drama:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 mb-2">
            <Film className="w-3.5 h-3.5" />
            CATALOG MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            All Asian Dramas & Movies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, edit metadata, manage badges, and delete platform dramas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tmdb"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-extrabold hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20"
          >
            <Sparkles className="w-4 h-4" /> TMDB Auto-Import
          </Link>
          <Link
            href="/dramas/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#00E676]" /> New Manual Drama
          </Link>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0E1118] border border-slate-800 flex flex-wrap items-center gap-3 text-xs shadow-lg">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#181C26] border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#00E676]"
          />
        </div>

        {/* Country */}
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setPage(1);
          }}
          className="bg-[#181C26] border border-slate-700 text-white font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-[#00E676]"
        >
          <option value="ALL">🌏 All Countries</option>
          <option value="KOREA">🇰🇷 Korea (K-Drama)</option>
          <option value="CHINA">🇨🇳 China (C-Drama)</option>
          <option value="JAPAN">🇯🇵 Japan (J-Drama)</option>
          <option value="THAILAND">🇹🇭 Thailand (Thai)</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-[#181C26] border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00E676]"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="ONGOING">Ongoing</option>
          <option value="UPCOMING">Upcoming</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#181C26] border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#00E676]"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="year">Newest Year</option>
          <option value="title">Title (A-Z)</option>
        </select>

        <button
          onClick={loadDramas}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Catalog Table */}
      <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">
            Showing <span className="text-white">{dramas.length}</span> of{' '}
            <span className="text-white">{totalCount}</span> dramas
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#181C26] animate-pulse" />
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Film className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Dramas Match Filters</h3>
            <p className="text-xs text-slate-400">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-3">
                  <th className="pb-3 font-semibold">Poster & Title</th>
                  <th className="pb-3 font-semibold">Country</th>
                  <th className="pb-3 font-semibold">Episodes</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold text-center">Sinhala Sub</th>
                  <th className="pb-3 font-semibold text-center">Trending</th>
                  <th className="pb-3 font-semibold text-center">Featured</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dramas.map((drama) => (
                  <tr key={drama.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Title & Poster */}
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={drama.posterUrl}
                          alt={drama.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/dramas/${drama.id}`}
                            className="font-bold text-white hover:text-[#00E676] transition-colors truncate block"
                          >
                            {drama.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {drama.releaseYear} · {drama.genres?.map((g) => g.genre?.name).join(', ') || 'Drama'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          drama.country === 'CHINA'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-[#00E676]/20 text-[#00E676]'
                        }`}
                      >
                        {drama.country === 'CHINA' ? '🇨🇳 C-Drama' : '🇰🇷 K-Drama'}
                      </span>
                    </td>

                    {/* Episodes */}
                    <td className="py-3 font-semibold text-slate-300">
                      <Link
                        href={`/episodes?dramaId=${drama.id}`}
                        className="hover:text-[#00E676] underline-offset-2 hover:underline flex items-center gap-1"
                      >
                        <Tv className="w-3 h-3 text-[#00E676]" />
                        {drama._count?.episodes || drama.totalEpisodes} Eps
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{drama.averageRating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Sinhala Sub Toggle */}
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleToggle(drama.id, 'hasSinhalaSub', drama.hasSinhalaSub)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          drama.hasSinhalaSub
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                      >
                        {drama.hasSinhalaSub ? '✓ Subbed' : 'No Sub'}
                      </button>
                    </td>

                    {/* Trending Toggle */}
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleToggle(drama.id, 'isTrending', drama.isTrending)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          drama.isTrending
                            ? 'bg-[#00E676] text-black font-black'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                      >
                        {drama.isTrending ? '🔥 Hot' : 'Off'}
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleToggle(drama.id, 'isFeatured', drama.isFeatured)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          drama.isFeatured
                            ? 'bg-purple-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                      >
                        {drama.isFeatured ? '⭐ Banner' : 'Off'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`http://localhost:3000/korean-dramas/${drama.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="View on Live Site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/episodes?dramaId=${drama.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#00E676]"
                          title="Manage Episodes"
                        >
                          <Tv className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/dramas/${drama.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Drama Metadata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(drama)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Delete Drama"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1118] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Drama</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">&ldquo;{deleteTarget.title}&rdquo;</span> and all its associated episodes, reviews, and watch histories?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Drama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
