'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Plus, ArrowLeft, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewDramaPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchApi('/admin/dramas', {
        method: 'POST',
        body: JSON.stringify({
          title,
          originalTitle,
          description,
          posterUrl: posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
          releaseYear: Number(releaseYear),
          status,
          totalEpisodes: Number(totalEpisodes),
          runtimeMinutes: Number(runtimeMinutes),
          director,
          screenwriter,
          studio,
        }),
      });

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create drama');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white glass px-3 py-1.5 rounded-lg border border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Overview
      </Link>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Plus className="w-6 h-6 text-primary-500" />
            Add New Korean Drama
          </h1>
          <p className="text-slate-400 text-xs mt-1">Publish new drama metadata, poster assets, and season structure</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">English Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Queen of Tears"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Korean Original Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 눈물의 여왕"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Synopsis / Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Detailed storyline plot overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Poster Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Backdrop Banner URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Release Year</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              >
                <option value="COMPLETED">Completed</option>
                <option value="ONGOING">Ongoing</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Total Episodes</label>
              <input
                type="number"
                value={totalEpisodes}
                onChange={(e) => setTotalEpisodes(Number(e.target.value))}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Runtime (mins)</label>
              <input
                type="number"
                value={runtimeMinutes}
                onChange={(e) => setRuntimeMinutes(Number(e.target.value))}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Director</label>
              <input
                type="text"
                placeholder="Director name"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Screenwriter</label>
              <input
                type="text"
                placeholder="Writer name"
                value={screenwriter}
                onChange={(e) => setScreenwriter(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Studio Network</label>
              <input
                type="text"
                placeholder="e.g. tvN / Netflix"
                value={studio}
                onChange={(e) => setStudio(e.target.value)}
                className="w-full bg-surface border border-border text-white p-3 rounded-xl focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-purple text-white font-bold text-sm shadow-xl shadow-primary-600/30 hover:opacity-95 transition-opacity"
          >
            {loading ? 'Publishing Drama...' : 'Publish Drama'}
          </button>
        </form>
      </div>
    </div>
  );
}
