'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import {
  Wrench,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Loader2,
  Server,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function ToolsMaintenancePage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSyncTmdbPosters = async () => {
    setSyncing(true);
    setSyncResult(null);
    setErrorMsg('');

    try {
      const res = await fetchApi<any>('/admin/sync-tmdb', { method: 'POST' });
      setSyncResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sync with TMDB');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/30 mb-2">
          <Wrench className="w-3.5 h-3.5" />
          SYSTEM & DATABASE MAINTENANCE
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Tools, Sync & Health Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform batch operations, sync TMDB assets across catalog, and check backend connectivity.
        </p>
      </div>

      {/* Notifications */}
      {syncResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 space-y-3 animate-fade-in shadow-xl text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#00E676] shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">{syncResult.message}</p>
              <p className="text-slate-400">{syncResult.totalSynced} dramas updated with HD TMDB assets.</p>
            </div>
          </div>

          {syncResult.results && syncResult.results.length > 0 && (
            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 max-h-40 overflow-y-auto space-y-1">
              {syncResult.results.map((r: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-white font-medium">{r.title}</span>
                  <span className={r.updated ? 'text-[#00E676] font-bold' : 'text-slate-500'}>
                    {r.updated ? '✓ Synced' : 'No change'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tool 1: TMDB Batch Sync */}
        <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00E676]" />
            </div>
            <h3 className="text-base font-extrabold text-white">TMDB Poster & Backdrop Batch Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Iterates through all dramas in your database and matches them with official TMDB high-res posters (w500) and unblurred 1080p backdrops (w1280).
            </p>
          </div>

          <button
            onClick={handleSyncTmdbPosters}
            disabled={syncing}
            className="w-full py-3 rounded-xl bg-[#00E676] text-black text-xs font-black hover:bg-[#00FF87] transition-all shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing with TMDB...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Run Full TMDB Sync
              </>
            )}
          </button>
        </div>

        {/* Tool 2: Server & Database Information */}
        <div className="p-6 rounded-3xl bg-[#0E1118] border border-slate-800 space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-extrabold text-white">Platform Environment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Active configuration details and streaming endpoints.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Backend API</span>
              <span className="font-mono font-bold text-white">http://localhost:4000/api/v1</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Database</span>
              <span className="font-bold text-emerald-400">SQLite (Prisma ORM)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Admin Port</span>
              <span className="font-mono font-bold text-[#00E676]">Port 3001</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">User App Port</span>
              <span className="font-mono font-bold text-cyan-400">Port 3000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
