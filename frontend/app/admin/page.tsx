'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { Shield, Users, Film, Tv, Clock, DollarSign, Plus, Eye, Star } from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any>('/admin/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-pink/20 text-accent-pink text-xs font-bold border border-accent-pink/30 mb-1">
            <Shield className="w-3.5 h-3.5" />
            ADMINISTRATOR CONTROL PANEL
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Vionu Executive Overview</h1>
        </div>

        <Link
          href="/admin/dramas/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-purple text-white font-bold text-xs shadow-lg shadow-primary-600/30 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add New K-Drama
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Registered Users</span>
                <Users className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-3xl font-black text-white">{data?.stats?.totalUsers || 0}</span>
              <span className="text-[10px] text-green-400 block font-medium">+14.2% this month</span>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">K-Drama Catalog</span>
                <Film className="w-5 h-5 text-accent-pink" />
              </div>
              <span className="text-3xl font-black text-white">{data?.stats?.totalDramas || 0}</span>
              <span className="text-[10px] text-slate-400 block font-medium">{data?.stats?.totalEpisodes} Total Episodes</span>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Watch Hours</span>
                <Clock className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-3xl font-black text-white">{data?.stats?.totalWatchTimeHours || 0} hrs</span>
              <span className="text-[10px] text-slate-400 block font-medium">Across all streamed episodes</span>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Est. Monthly Revenue</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-3xl font-black text-white">${data?.stats?.revenueEstimatedUsd || 0}</span>
              <span className="text-[10px] text-green-400 block font-medium">Based on active VIP tier</span>
            </div>
          </div>

          {/* Quick Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Dramas Table */}
            <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary-500" />
                  Recent K-Dramas
                </h3>
                <Link href="/admin/dramas" className="text-xs text-primary-400 font-semibold hover:underline">
                  Manage All
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {data?.recentDramas?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-white/5">
                    <div>
                      <h4 className="font-bold text-white">{d.title}</h4>
                      <span className="text-slate-400 text-[10px]">{d.releaseYear} • {d.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{d.averageRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users Table */}
            <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-purple" />
                  Recent Registered Users
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {data?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/60 border border-white/5">
                    <div>
                      <h4 className="font-bold text-white">{u.name}</h4>
                      <span className="text-slate-400 text-[10px]">{u.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-primary-600/30 text-primary-300 font-semibold uppercase text-[10px]">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
