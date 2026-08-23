'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';
import { User as UserIcon, Mail, Shield, Film, Bookmark, History, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, initFromStorage } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initFromStorage();
    fetchApi<any>('/users/profile')
      .then(setStats)
      .catch(console.error);
  }, [initFromStorage]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <Link href="/login" className="inline-block px-6 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Card */}
      <div className="glass p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500 shadow-xl bg-surface shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-600/30 text-primary-300 text-[10px] font-bold uppercase border border-primary-500/30">
              {user.role}
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400">
            <Mail className="w-3.5 h-3.5" />
            <span>{user.email}</span>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-accent-pink text-white font-bold text-xs shadow-lg shadow-accent-pink/30 hover:opacity-90 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/10 text-center space-y-1">
          <Bookmark className="w-5 h-5 text-primary-500 mx-auto" />
          <span className="text-2xl font-black text-white">{stats?._count?.watchlists || 0}</span>
          <span className="text-[11px] text-slate-400 block font-medium">Saved Watchlist</span>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/10 text-center space-y-1">
          <History className="w-5 h-5 text-accent-purple mx-auto" />
          <span className="text-2xl font-black text-white">{stats?._count?.watchHistory || 0}</span>
          <span className="text-[11px] text-slate-400 block font-medium">Episodes Watched</span>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/10 text-center space-y-1">
          <Star className="w-5 h-5 text-amber-400 mx-auto" />
          <span className="text-2xl font-black text-white">{stats?._count?.ratings || 0}</span>
          <span className="text-[11px] text-slate-400 block font-medium">Dramas Rated</span>
        </div>

        <div className="glass p-4 rounded-2xl border border-white/10 text-center space-y-1">
          <Film className="w-5 h-5 text-accent-pink mx-auto" />
          <span className="text-2xl font-black text-white">{stats?._count?.reviews || 0}</span>
          <span className="text-[11px] text-slate-400 block font-medium">Reviews Written</span>
        </div>
      </div>
    </div>
  );
}
