'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  Search,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Film,
  Star,
  Settings2,
  Loader2,
  Tv,
  Eye,
  ArrowRight
} from 'lucide-react';
import { TmdbItem } from '@/types';

export default function TmdbImporterPage() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'tv' | 'movie'>('tv');
  const [results, setResults] = useState<TmdbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Import State
  const [importingId, setImportingId] = useState<number | null>(null);
  const [successDrama, setSuccessDrama] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Customize Modal State
  const [selectedItem, setSelectedItem] = useState<TmdbItem | null>(null);
  const [customCountry, setCustomCountry] = useState('KOREA');
  const [hasSinhalaSub, setHasSinhalaSub] = useState(true);
  const [translatorName, setTranslatorName] = useState('Vionu Sinhala Team');
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [defaultVideoUrl, setDefaultVideoUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [autoCreateEpisodes, setAutoCreateEpisodes] = useState(true);

  // Popular search chips
  const presets = [
    { label: 'Queen of Tears', query: 'Queen of Tears' },
    { label: 'Lovely Runner', query: 'Lovely Runner' },
    { label: 'The Double', query: 'The Double' },
    { label: 'Amidst a Snowstorm', query: 'Amidst a Snowstorm of Love' },
    { label: 'Hidden Love', query: 'Hidden Love' },
    { label: 'Crash Landing on You', query: 'Crash Landing on You' },
    { label: 'Marry My Husband', query: 'Marry My Husband' },
    { label: 'Twinkling Watermelon', query: 'Twinkling Watermelon' },
  ];

  const handleSearch = async (searchKeyword?: string) => {
    const q = searchKeyword || query;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessDrama(null);
    setSearched(true);

    try {
      const res = await fetchApi<TmdbItem[]>(
        `/admin/tmdb/search?q=${encodeURIComponent(q.trim())}&type=${mediaType}`
      );
      setResults(res || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to search TMDB. Ensure backend is running.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickImport = async (item: TmdbItem) => {
    setImportingId(item.id);
    setErrorMessage('');
    setSuccessDrama(null);

    try {
      const res = await fetchApi<any>('/admin/tmdb/import', {
        method: 'POST',
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.mediaType,
          customCountry: item.country !== 'OTHER' ? item.country : 'KOREA',
          hasSinhalaSub: true,
          translatorName: 'Vionu Sinhala Team',
          isTrending: false,
          isFeatured: false,
          defaultVideoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          autoCreateEpisodes: true,
        }),
      });

      setSuccessDrama(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import drama.');
    } finally {
      setImportingId(null);
    }
  };

  const openCustomizeModal = (item: TmdbItem) => {
    setSelectedItem(item);
    setCustomCountry(item.country !== 'OTHER' ? item.country : 'KOREA');
    setHasSinhalaSub(true);
    setTranslatorName('Vionu Sinhala Team');
    setIsTrending(false);
    setIsFeatured(false);
    setDefaultVideoUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
    setAutoCreateEpisodes(true);
  };

  const handleCustomImport = async () => {
    if (!selectedItem) return;
    setImportingId(selectedItem.id);
    setErrorMessage('');
    setSuccessDrama(null);

    try {
      const res = await fetchApi<any>('/admin/tmdb/import', {
        method: 'POST',
        body: JSON.stringify({
          tmdbId: selectedItem.id,
          mediaType: selectedItem.mediaType,
          customCountry,
          hasSinhalaSub,
          translatorName,
          isTrending,
          isFeatured,
          defaultVideoUrl,
          autoCreateEpisodes,
        }),
      });

      setSuccessDrama(res);
      setSelectedItem(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to import drama.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            TMDB LIVE SEARCH & 1-CLICK IMPORTER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Import Dramas & Movies from TMDB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search any Asian TV drama or movie, automatically download official posters, 1080p backdrops, cast & genres, and generate all episodes.
          </p>
        </div>

        <Link
          href="/dramas/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors w-fit"
        >
          <Settings2 className="w-4 h-4" />
          Manual Form Entry
        </Link>
      </div>

      {/* Success Notification */}
      {successDrama && (
        <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#00E676] shrink-0" />
            <div>
              <p className="text-sm font-black text-white">
                &ldquo;{successDrama.title}&rdquo; Successfully Imported!
              </p>
              <p className="text-xs text-emerald-300/80">
                Created with {successDrama.totalEpisodes || 16} episodes, cast, genres, and HD media.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`http://localhost:3000/korean-dramas/${successDrama.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00E676] text-black text-xs font-extrabold hover:bg-[#00FF87] transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View on Live Site
            </a>
            <Link
              href={`/episodes?dramaId=${successDrama.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Tv className="w-3.5 h-3.5 text-[#00E676]" /> Manage Streams
            </Link>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Search Input Box */}
      <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by drama title or TMDB ID (e.g. Queen of Tears, The Double, Lovely Runner, Hidden Love)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#181C26] border border-slate-700 text-white text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all placeholder:text-slate-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="bg-[#181C26] border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-[#00E676]"
            >
              <option value="tv">📺 TV Shows & K-Dramas</option>
              <option value="movie">🎬 Movies</option>
            </select>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] disabled:opacity-50 transition-all shadow-lg shadow-[#00E676]/20 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search TMDB
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400">Popular Quick Searches:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setQuery(p.query);
                handleSearch(p.query);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#00E676]/10 hover:text-[#00E676] text-slate-300 text-[11px] font-medium transition-colors border border-slate-700/60"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-[#00E676]" />
            Search Results
            {results.length > 0 && (
              <span className="text-xs text-slate-400 font-medium">({results.length} found)</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-[#0E1118] animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => {
              const isImporting = importingId === item.id;
              const flag =
                item.country === 'CHINA'
                  ? '🇨🇳'
                  : item.country === 'KOREA'
                  ? '🇰🇷'
                  : item.country === 'JAPAN'
                  ? '🇯🇵'
                  : item.country === 'THAILAND'
                  ? '🇹🇭'
                  : '🌏';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#0E1118] border border-slate-800 hover:border-slate-700 transition-all flex gap-3 group relative overflow-hidden"
                >
                  {/* Poster Thumbnail */}
                  <div className="w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 shrink-0 relative border border-slate-700/60">
                    {item.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No Poster
                      </div>
                    )}
                    <span className="absolute top-1 left-1 text-xs">{flag}</span>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00E676] transition-colors truncate">
                        {item.title}
                      </h3>
                      {item.originalTitle && item.originalTitle !== item.title && (
                        <p className="text-[10px] text-slate-400 truncate">{item.originalTitle}</p>
                      )}

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{item.releaseYear}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.voteAverage}
                        </span>
                        <span>·</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {item.country}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {item.overview || 'No synopsis provided.'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleQuickImport(item)}
                        disabled={isImporting}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] disabled:opacity-50 transition-colors shadow-md"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> 1-Click Import
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openCustomizeModal(item)}
                        disabled={isImporting}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Customize metadata & options before import"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : searched ? (
          <div className="text-center py-16 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-3">
            <Film className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Results for &ldquo;{query}&rdquo;</h3>
            <p className="text-xs text-slate-400">
              Try searching with the English title or native name (e.g. 눈물의 여왕).
            </p>
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl bg-[#0E1118] border border-slate-800/80 space-y-3">
            <Search className="w-10 h-10 text-[#00E676]/40 mx-auto" />
            <h3 className="text-sm font-bold text-white">Search any Drama to Start</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Type the title of any Korean, Chinese, or Asian drama to preview and import full metadata directly into the database.
            </p>
          </div>
        )}
      </div>

      {/* ── CUSTOMIZE & IMPORT MODAL ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1118] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Customize & Import Drama</h3>
                <p className="text-xs text-slate-400">{selectedItem.title} ({selectedItem.releaseYear})</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Country Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Country / Category</label>
                <select
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5 font-semibold"
                >
                  <option value="KOREA">🇰🇷 Korea (K-Drama)</option>
                  <option value="CHINA">🇨🇳 China (C-Drama)</option>
                  <option value="JAPAN">🇯🇵 Japan (J-Drama)</option>
                  <option value="THAILAND">🇹🇭 Thailand (Thai Drama)</option>
                </select>
              </div>

              {/* Sinhala Subtitle Settings */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Sinhala Subtitles Available</span>
                  <input
                    type="checkbox"
                    checked={hasSinhalaSub}
                    onChange={(e) => setHasSinhalaSub(e.target.checked)}
                    className="w-4 h-4 accent-[#00E676] rounded"
                  />
                </div>
                {hasSinhalaSub && (
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Translator Credit Name</label>
                    <input
                      type="text"
                      value={translatorName}
                      onChange={(e) => setTranslatorName(e.target.value)}
                      className="w-full bg-[#181C26] border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Badges Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-300">Set as Trending</span>
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 accent-[#00E676] rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <span className="font-semibold text-slate-300">Feature on Banner</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#00E676] rounded"
                  />
                </label>
              </div>

              {/* Video Stream Template */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Default Episode Video Stream (HLS .m3u8 / MP4)</label>
                <input
                  type="text"
                  value={defaultVideoUrl}
                  onChange={(e) => setDefaultVideoUrl(e.target.value)}
                  placeholder="https://.../stream.m3u8"
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5 font-mono text-[11px]"
                />
              </div>

              {/* Auto Create Episodes */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCreateEpisodes}
                  onChange={(e) => setAutoCreateEpisodes(e.target.checked)}
                  className="w-4 h-4 accent-[#00E676] rounded"
                />
                <span>Automatically generate all episodes (Ep 1 to N)</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomImport}
                disabled={importingId !== null}
                className="px-5 py-2 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] flex items-center gap-1.5"
              >
                {importingId !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
