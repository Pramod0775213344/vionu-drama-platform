'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import {
  Tv,
  PlusCircle,
  Play,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Film,
  Sparkles,
  Layers,
  Copy,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import { Drama, Episode } from '@/types';

function EpisodeManagerContent() {
  const searchParams = useSearchParams();
  const initialDramaId = searchParams.get('dramaId') || '';

  const [dramas, setDramas] = useState<Drama[]>([]);
  const [selectedDramaId, setSelectedDramaId] = useState(initialDramaId);
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk Generator Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState(16);
  const [bulkTemplateUrl, setBulkTemplateUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // Add / Edit Modal
  const [modalEpisode, setModalEpisode] = useState<Partial<Episode> | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [savingEp, setSavingEp] = useState(false);

  // Video Test Player Modal
  const [testVideoUrl, setTestVideoUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load all dramas for the selector dropdown
  useEffect(() => {
    fetchApi<{ data: Drama[] }>('/admin/dramas?limit=100')
      .then((res) => {
        const list = res.data || [];
        setDramas(list);
        if (!selectedDramaId && list.length > 0) {
          setSelectedDramaId(list[0].id);
        }
      })
      .catch(console.error);
  }, [selectedDramaId]);

  // Load episodes when drama changes
  const loadEpisodes = useCallback(async (dramaId: string) => {
    if (!dramaId) return;
    setLoadingEpisodes(true);
    setErrorMsg('');
    try {
      const [drama, epList] = await Promise.all([
        fetchApi<Drama>(`/admin/dramas/${dramaId}`),
        fetchApi<Episode[]>(`/admin/episodes?dramaId=${dramaId}`),
      ]);
      setSelectedDrama(drama);
      setEpisodes(epList || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load episodes');
    } finally {
      setLoadingEpisodes(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDramaId) {
      loadEpisodes(selectedDramaId);
    }
  }, [selectedDramaId, loadEpisodes]);

  // Handle Copy URL
  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Create Episode Modal
  const openCreateModal = () => {
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.episodeNumber)) + 1 : 1;
    setModalEpisode({
      episodeNumber: nextNum,
      title: `Episode ${nextNum}`,
      description: `${selectedDrama?.title || ''} - Episode ${nextNum} with Sinhala Subtitles`,
      videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      videoProvider: 'HLS_STREAM',
      durationSeconds: (selectedDrama?.runtimeMinutes || 60) * 60,
      thumbnailUrl: selectedDrama?.backdropUrl || selectedDrama?.posterUrl || '',
    });
    setModalMode('create');
  };

  // Open Edit Episode Modal
  const openEditModal = (ep: Episode) => {
    setModalEpisode(ep);
    setModalMode('edit');
  };

  // Save Episode (Create or Edit)
  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEpisode || !selectedDramaId) return;
    setSavingEp(true);
    setErrorMsg('');

    try {
      if (modalMode === 'create') {
        await fetchApi('/admin/episodes', {
          method: 'POST',
          body: JSON.stringify({
            dramaId: selectedDramaId,
            ...modalEpisode,
          }),
        });
        setSuccessMsg(`Episode ${modalEpisode.episodeNumber} created successfully!`);
      } else {
        await fetchApi(`/admin/episodes/${modalEpisode.id}`, {
          method: 'PATCH',
          body: JSON.stringify(modalEpisode),
        });
        setSuccessMsg(`Episode ${modalEpisode.episodeNumber} updated successfully!`);
      }
      setModalEpisode(null);
      loadEpisodes(selectedDramaId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save episode');
    } finally {
      setSavingEp(false);
    }
  };

  // Delete Episode
  const handleDeleteEpisode = async (id: string, epNum: number) => {
    if (!confirm(`Delete Episode ${epNum}?`)) return;
    try {
      await fetchApi(`/admin/episodes/${id}`, { method: 'DELETE' });
      setEpisodes((prev) => prev.filter((e) => e.id !== id));
      setSuccessMsg(`Episode ${epNum} deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete episode');
    }
  };

  // Bulk Generate Episodes
  const handleBulkGenerate = async () => {
    if (!selectedDramaId) return;
    setBulkGenerating(true);
    try {
      await fetchApi('/admin/episodes/bulk', {
        method: 'POST',
        body: JSON.stringify({
          dramaId: selectedDramaId,
          count: Number(bulkCount),
          templateVideoUrl: bulkTemplateUrl,
        }),
      });
      setShowBulkModal(false);
      loadEpisodes(selectedDramaId);
      setSuccessMsg(`Generated ${bulkCount} episodes successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to bulk generate episodes');
    } finally {
      setBulkGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 mb-2">
            <Tv className="w-3.5 h-3.5" />
            STREAMING & EPISODES MANAGER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manage Video Streams & Episodes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update HLS streams (.m3u8), MP4 direct video URLs, thumbnails, and generate episode sets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={!selectedDramaId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> Bulk Generator
          </button>
          <button
            onClick={openCreateModal}
            disabled={!selectedDramaId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" /> Add Single Episode
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drama Selector Dropdown Bar */}
      <div className="p-5 rounded-3xl bg-[#0E1118] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex-1 space-y-1">
          <label className="block text-slate-400 text-xs font-bold">Select Drama to Manage:</label>
          <select
            value={selectedDramaId}
            onChange={(e) => setSelectedDramaId(e.target.value)}
            className="w-full bg-[#181C26] border border-slate-700 text-white font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-[#00E676]"
          >
            {dramas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.country === 'CHINA' ? '🇨🇳' : '🇰🇷'} {d.title} ({d.releaseYear}) — {d._count?.episodes || d.totalEpisodes} Episodes
              </option>
            ))}
          </select>
        </div>

        {selectedDrama && (
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:border-l sm:border-slate-800 sm:pl-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedDrama.posterUrl}
              alt={selectedDrama.title}
              className="w-12 h-16 rounded-xl object-cover border border-slate-700"
            />
            <div className="text-xs">
              <p className="font-extrabold text-white">{selectedDrama.title}</p>
              <p className="text-slate-400">{selectedDrama.releaseYear} · {selectedDrama.status}</p>
              <span className="text-[#00E676] font-bold mt-0.5 block">
                {episodes.length} Episodes Loaded
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Episodes Table */}
      <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-[#00E676]" />
            <h3 className="text-base font-extrabold text-white">Episodes List</h3>
            <span className="text-xs text-slate-400">({episodes.length} total)</span>
          </div>

          <button
            onClick={() => loadEpisodes(selectedDramaId)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingEpisodes ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingEpisodes ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[#181C26] animate-pulse" />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Tv className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Episodes Created Yet</h4>
            <p className="text-xs text-slate-400">Click &ldquo;Bulk Generator&rdquo; or &ldquo;Add Single Episode&rdquo; to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-3">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Thumbnail & Title</th>
                  <th className="pb-3 font-semibold">Video Stream URL (HLS / MP4)</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {episodes.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Ep Number */}
                    <td className="py-3 font-black text-[#00E676] w-12 text-center text-sm">
                      {ep.episodeNumber}
                    </td>

                    {/* Thumbnail & Title */}
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ep.thumbnailUrl || selectedDrama?.backdropUrl || selectedDrama?.posterUrl || ''}
                          alt={ep.title}
                          className="w-16 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                        />
                        <div>
                          <p className="font-bold text-white">{ep.title}</p>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{ep.description || 'No description'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Video URL */}
                    <td className="py-3 font-mono text-[11px] text-slate-300 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="truncate block flex-1 bg-[#141720] px-2.5 py-1 rounded-md border border-slate-700/60 text-slate-300">
                          {ep.videoUrl || 'No video URL set'}
                        </span>
                        {ep.videoUrl && (
                          <button
                            onClick={() => handleCopy(ep.videoUrl, ep.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
                            title="Copy URL"
                          >
                            {copiedId === ep.id ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 text-slate-400 font-medium">
                      {Math.round((ep.durationSeconds || 3600) / 60)} mins
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Test Play */}
                        {ep.videoUrl && (
                          <button
                            onClick={() => setTestVideoUrl(ep.videoUrl)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-[#00E676] hover:bg-emerald-500/30"
                            title="Test Play Stream"
                          >
                            <Play className="w-3.5 h-3.5 fill-[#00E676]" />
                          </button>
                        )}
                        {/* Live Player link */}
                        {selectedDrama && (
                          <a
                            href={`http://localhost:3000/watch/${selectedDrama.slug}/${ep.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Open on Web Player"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(ep)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Episode"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteEpisode(ep.id, ep.episodeNumber)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                          title="Delete Episode"
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

      {/* ── CREATE / EDIT MODAL ── */}
      {modalEpisode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1118] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                {modalMode === 'create' ? 'Add Episode' : `Edit Episode ${modalEpisode.episodeNumber}`}
              </h3>
              <button
                onClick={() => setModalEpisode(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Episode Number *</label>
                  <input
                    type="number"
                    required
                    value={modalEpisode.episodeNumber || 1}
                    onChange={(e) =>
                      setModalEpisode({ ...modalEpisode, episodeNumber: Number(e.target.value) })
                    }
                    className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={modalEpisode.durationSeconds || 3600}
                    onChange={(e) =>
                      setModalEpisode({ ...modalEpisode, durationSeconds: Number(e.target.value) })
                    }
                    className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Episode Title</label>
                <input
                  type="text"
                  value={modalEpisode.title || ''}
                  onChange={(e) => setModalEpisode({ ...modalEpisode, title: e.target.value })}
                  placeholder="Episode 1"
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Video Stream URL (HLS .m3u8 or MP4) *</label>
                <input
                  type="text"
                  required
                  value={modalEpisode.videoUrl || ''}
                  onChange={(e) => setModalEpisode({ ...modalEpisode, videoUrl: e.target.value })}
                  placeholder="https://.../stream.m3u8"
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={modalEpisode.thumbnailUrl || ''}
                  onChange={(e) => setModalEpisode({ ...modalEpisode, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={modalEpisode.description || ''}
                  onChange={(e) => setModalEpisode({ ...modalEpisode, description: e.target.value })}
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEpisode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEp}
                  className="px-5 py-2 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] flex items-center gap-1.5"
                >
                  {savingEp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BULK GENERATOR MODAL ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1118] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E676]" />
                <h3 className="text-base font-extrabold text-white">Bulk Episode Generator</h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Auto-generate multiple episode entries for <span className="font-bold text-white">&ldquo;{selectedDrama?.title}&rdquo;</span>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Number of Episodes to Create</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Template Video URL (HLS / MP4)</label>
                <input
                  type="text"
                  value={bulkTemplateUrl}
                  onChange={(e) => setBulkTemplateUrl(e.target.value)}
                  className="w-full bg-[#181C26] border border-slate-700 text-white rounded-xl p-2.5 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkGenerating}
                className="px-5 py-2 rounded-xl bg-[#00E676] text-black font-black hover:bg-[#00FF87] flex items-center gap-1.5"
              >
                {bulkGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Generate Episodes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TEST VIDEO PLAYER MODAL ── */}
      {testVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1118] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00E676]" /> Stream Preview Player
              </h3>
              <button
                onClick={() => setTestVideoUrl(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
              <video
                src={testVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 truncate">
              Source: {testVideoUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EpisodeManagerPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading Episode Manager...</div>}>
      <EpisodeManagerContent />
    </Suspense>
  );
}
