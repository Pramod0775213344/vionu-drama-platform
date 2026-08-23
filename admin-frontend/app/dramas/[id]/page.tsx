'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  ArrowLeft,
  Edit,
  Save,
  Tv,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film
} from 'lucide-react';
import { Genre, Drama } from '@/types';

export default function EditDramaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [country, setCountry] = useState('KOREA');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState(2026);
  const [status, setStatus] = useState<'COMPLETED' | 'ONGOING' | 'UPCOMING'>('COMPLETED');
  const [totalEpisodes, setTotalEpisodes] = useState(16);
  const [runtimeMinutes, setRuntimeMinutes] = useState(60);
  const [director, setDirector] = useState('');
  const [screenwriter, setScreenwriter] = useState('');
  const [studio, setStudio] = useState('');
  const [hasSinhalaSub, setHasSinhalaSub] = useState(true);
  const [translatorName, setTranslatorName] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const [slug, setSlug] = useState('');
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchApi<Drama>(`/admin/dramas/${id}`),
      fetchApi<Genre[]>('/admin/genres'),
    ])
      .then(([drama, genres]) => {
        setAvailableGenres(genres || []);
        if (drama) {
          setTitle(drama.title);
          setOriginalTitle(drama.originalTitle || '');
          setCountry(drama.country || 'KOREA');
          setDescription(drama.description || '');
          setPosterUrl(drama.posterUrl || '');
          setBackdropUrl(drama.backdropUrl || '');
          setReleaseYear(drama.releaseYear);
          setStatus(drama.status as any);
          setTotalEpisodes(drama.totalEpisodes);
          setRuntimeMinutes(drama.runtimeMinutes);
          setDirector(drama.director || '');
          setScreenwriter(drama.screenwriter || '');
          setStudio(drama.studio || '');
          setHasSinhalaSub(drama.hasSinhalaSub);
          setTranslatorName(drama.translatorName || '');
          setIsFeatured(drama.isFeatured);
          setIsTrending(drama.isTrending);
          setSlug(drama.slug);
          setSelectedGenreIds(drama.genres?.map((g) => g.genreId || g.genre?.id) || []);
        }
      })
      .catch((err) => setError(err.message || 'Failed to load drama'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await fetchApi(`/admin/dramas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          originalTitle,
          description,
          posterUrl,
          backdropUrl,
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
        }),
      });

      setSuccess('Drama metadata updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenreIds((prev) =>
      prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId]
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E676] mx-auto" />
        <p className="text-xs text-slate-400">Loading drama details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="space-y-3">
        <Link
          href="/dramas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Edit className="w-6 h-6 text-[#00E676]" />
              Edit Drama: {title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Slug: {slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:3000/korean-dramas/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5" /> View on Site
            </a>
            <Link
              href={`/episodes?dramaId=${id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 hover:bg-[#00E676]/20"
            >
              <Tv className="w-3.5 h-3.5" /> Manage Episodes
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── EDIT FORM ── */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-6 shadow-xl text-xs">
        {/* Title Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">English Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Original / Native Title</label>
            <input
              type="text"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Country & Status & Release Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Country / Category</label>
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
            <label className="font-bold text-slate-300">Status</label>
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
            <label className="font-bold text-slate-300">Studio / Network</label>
            <input
              type="text"
              value={studio}
              onChange={(e) => setStudio(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Posters & Backdrops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Poster Image URL (w500)</label>
            <input
              type="text"
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

        {/* Genres */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300">Genres</label>
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/dramas"
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
