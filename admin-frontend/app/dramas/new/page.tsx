'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
  Eye,
  Search
} from 'lucide-react';
import { Genre, TmdbItem } from '@/types';

export default function AddDramaPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [country, setCountry] = useState('KOREA');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState<'COMPLETED' | 'ONGOING' | 'UPCOMING'>('COMPLETED');
  const [totalEpisodes, setTotalEpisodes] = useState(16);
  const [runtimeMinutes, setRuntimeMinutes] = useState(60);
  const [director, setDirector] = useState('');
  const [screenwriter, setScreenwriter] = useState('');
  const [studio, setStudio] = useState('Vionu Studio');
  const [hasSinhalaSub, setHasSinhalaSub] = useState(true);
  const [translatorName, setTranslatorName] = useState('Vionu Sinhala Team');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [defaultVideoUrl, setDefaultVideoUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [autoCreateEpisodes, setAutoCreateEpisodes] = useState(true);

  // Genre selection
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  // TMDB quick autofill
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [tmdbSuggestions, setTmdbSuggestions] = useState<TmdbItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApi<Genre[]>('/admin/genres')
      .then(setAvailableGenres)
      .catch(() => {});
  }, []);

  const handleTmdbSearch = async () => {
    if (!tmdbQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await fetchApi<TmdbItem[]>(
        `/admin/tmdb/search?q=${encodeURIComponent(tmdbQuery.trim())}&type=tv`
      );
      setTmdbSuggestions(res || []);
    } catch {
      setTmdbSuggestions([]);
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleAutofillFromTmdb = async (item: TmdbItem) => {
    setTitle(item.title);
    setOriginalTitle(item.originalTitle || item.title);
    setDescription(item.overview || '');
    if (item.posterUrl) setPosterUrl(item.posterUrl);
    if (item.backdropUrl) setBackdropUrl(item.backdropUrl);
    if (item.releaseYear) setReleaseYear(item.releaseYear);
    if (item.country && item.country !== 'OTHER') setCountry(item.country);
    setTmdbSuggestions([]);
    setTmdbQuery('');

    // Fetch full details if possible
    try {
      const details = await fetchApi<any>(`/admin/tmdb/details/${item.id}?type=${item.mediaType}`);
      if (details) {
        if (details.totalEpisodes) setTotalEpisodes(details.totalEpisodes);
        if (details.runtimeMinutes) setRuntimeMinutes(details.runtimeMinutes);
        if (details.director) setDirector(details.director);
        if (details.screenwriter) setScreenwriter(details.screenwriter);
        if (details.studio) setStudio(details.studio);
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const created = await fetchApi<any>('/admin/dramas', {
        method: 'POST',
        body: JSON.stringify({
          title,
          originalTitle: originalTitle || title,
          description: description || 'No synopsis provided.',
          posterUrl: posterUrl || undefined,
          backdropUrl: backdropUrl || undefined,
          releaseYear: Number(releaseYear),
          status,
          totalEpisodes: Number(totalEpisodes),
          runtimeMinutes: Number(runtimeMinutes),
          country,
          hasSinhalaSub,
          translatorName,
          isFeatured,
          isTrending,
          director,
          screenwriter,
          studio,
          genreIds: selectedGenreIds,
          defaultVideoUrl,
          autoCreateEpisodes,
        }),
      });

      router.push(`/episodes?dramaId=${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create drama');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header & Back Link */}
      <div className="space-y-3">
        <Link
          href="/dramas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <PlusCircle className="w-7 h-7 text-[#00E676]" />
              Add New Drama
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Publish new Korean, Chinese, or Asian drama metadata, images, and episodes.
            </p>
          </div>
          <Link
            href="/tmdb"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold hover:bg-[#00E676]/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Or 1-Click TMDB Import
          </Link>
        </div>
      </div>

      {/* ── TMDB QUICK AUTO-FILL BAR ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00E676]/10 to-[#0E1118] border border-[#00E676]/30 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sparkles className="w-4 h-4 text-[#00E676]" />
          <span>Quick Autofill with TMDB:</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type drama title (e.g. Queen of Tears, Hidden Love)..."
            value={tmdbQuery}
            onChange={(e) => setTmdbQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTmdbSearch())}
            className="flex-1 bg-[#181C26] border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E676]"
          />
          <button
            type="button"
            onClick={handleTmdbSearch}
            disabled={tmdbSearching || !tmdbQuery.trim()}
            className="px-4 py-2 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-colors disabled:opacity-50"
          >
            {tmdbSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch Info'}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {tmdbSuggestions.length > 0 && (
          <div className="p-2 rounded-xl bg-[#141720] border border-slate-700 space-y-1.5 max-h-48 overflow-y-auto">
            {tmdbSuggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAutofillFromTmdb(item)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#00E676]/10 text-left transition-colors group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.posterUrl || ''}
                  alt={item.title}
                  className="w-8 h-11 object-cover rounded bg-slate-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-[#00E676] truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {item.releaseYear} · {item.country} · Rating: {item.voteAverage}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#00E676] px-2 py-1 rounded bg-[#00E676]/10 border border-[#00E676]/30">
                  Autofill Form
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── MAIN CREATION FORM ── */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-6 shadow-xl text-xs">
        {/* Title Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">English / Display Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Queen of Tears"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Original / Native Title</label>
            <input
              type="text"
              placeholder="e.g. 눈물의 여왕 / 墨雨云间"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Country & Status & Release Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Country / Category *</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white font-semibold rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="KOREA">🇰🇷 Korea (K-Drama)</option>
              <option value="CHINA">🇨🇳 China (C-Drama)</option>
              <option value="JAPAN">🇯🇵 Japan (J-Drama)</option>
              <option value="THAILAND">🇹🇭 Thailand (Thai Drama)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="COMPLETED">Completed</option>
              <option value="ONGOING">Ongoing</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Release Year</label>
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(Number(e.target.value))}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Synopsis */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300">Synopsis / Description</label>
          <textarea
            rows={4}
            placeholder="Plot summary, storyline, background..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-[#00E676]"
          />
        </div>

        {/* Episodes & Runtime & Studio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Total Episodes</label>
            <input
              type="number"
              value={totalEpisodes}
              onChange={(e) => setTotalEpisodes(Number(e.target.value))}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Episode Runtime (mins)</label>
            <input
              type="number"
              value={runtimeMinutes}
              onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Production Studio / Network</label>
            <input
              type="text"
              placeholder="e.g. tvN, Netflix, Tencent, iQIYI"
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Poster & Backdrop URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Poster Image URL (w500)</label>
            <input
              type="text"
              placeholder="https://image.tmdb.org/t/p/w500/..."
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
            {posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl}
                alt="Poster preview"
                className="h-28 rounded-lg object-cover mt-2 border border-slate-700"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Backdrop Banner URL (w1280)</label>
            <input
              type="text"
              placeholder="https://image.tmdb.org/t/p/w1280/..."
              value={backdropUrl}
              onChange={(e) => setBackdropUrl(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
            {backdropUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backdropUrl}
                alt="Backdrop preview"
                className="h-28 w-full rounded-lg object-cover mt-2 border border-slate-700"
              />
            )}
          </div>
        </div>

        {/* Genre Selection */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300">Genres & Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((g) => {
              const selected = selectedGenreIds.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selected
                      ? 'bg-[#00E676] text-black font-extrabold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sinhala Subtitles & Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Subtitle card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Sinhala Subtitles</span>
              <input
                type="checkbox"
                checked={hasSinhalaSub}
                onChange={(e) => setHasSinhalaSub(e.target.checked)}
                className="w-4 h-4 accent-[#00E676] rounded"
              />
            </div>
            {hasSinhalaSub && (
              <div>
                <label className="block text-slate-400 text-[10px] font-bold mb-1">Translator Credit</label>
                <input
                  type="text"
                  value={translatorName}
                  onChange={(e) => setTranslatorName(e.target.value)}
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-lg p-2 text-xs"
                />
              </div>
            )}
          </div>

          {/* Badges card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-white">Mark as Trending Now</span>
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 accent-[#00E676] rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-white">Feature on Top Hero Banner</span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#00E676] rounded"
              />
            </label>
          </div>
        </div>

        {/* Stream & Episode Generator */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-white">Auto-generate Episode Entries</p>
              <p className="text-[10px] text-slate-400">Creates Episode 1 through {totalEpisodes} with stream template</p>
            </div>
            <input
              type="checkbox"
              checked={autoCreateEpisodes}
              onChange={(e) => setAutoCreateEpisodes(e.target.checked)}
              className="w-4 h-4 accent-[#00E676] rounded"
            />
          </label>
          {autoCreateEpisodes && (
            <div>
              <label className="block text-slate-400 text-[10px] font-bold mb-1">Template Stream URL (HLS .m3u8 / MP4)</label>
              <input
                type="text"
                value={defaultVideoUrl}
                onChange={(e) => setDefaultVideoUrl(e.target.value)}
                className="w-full bg-[#181C26] border border-slate-700 text-white rounded-lg p-2 font-mono text-[11px]"
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/dramas"
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Publish Drama & Create Episodes
          </button>
        </div>
      </form>
    </div>
  );
}
