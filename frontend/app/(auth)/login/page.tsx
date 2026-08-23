'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Film, Lock, Mail, Sparkles } from 'lucide-react';
import { User } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      router.push(res.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 mx-auto flex items-center justify-center shadow-lg shadow-primary-600/40">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to continue watching your favorite K-Dramas</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Demo Account Hint Box */}
        <div className="bg-primary-600/10 border border-primary-500/30 p-3 rounded-xl text-xs space-y-1">
          <p className="font-bold text-primary-300">Demo Accounts Available:</p>
          <p className="text-slate-300">User: <code className="bg-black/50 px-1 py-0.5 rounded text-white">user@kdrama.com</code> / <code className="bg-black/50 px-1 py-0.5 rounded text-white">password123</code></p>
          <p className="text-slate-300">Admin: <code className="bg-black/50 px-1 py-0.5 rounded text-white">admin@kdrama.com</code> / <code className="bg-black/50 px-1 py-0.5 rounded text-white">admin123</code></p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@kdrama.com"
                className="w-full bg-surface border border-border text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border text-white text-xs rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-accent-purple text-white font-bold text-sm shadow-xl shadow-primary-600/30 hover:opacity-95 transition-opacity"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-400 font-bold hover:underline">
            Create One
          </Link>
        </div>
      </div>
    </div>
  );
}
