'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Film,
  PlusCircle,
  Tv,
  Wrench,
  ExternalLink,
  Activity,
  Menu,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'TMDB Importer', href: '/tmdb', icon: Search, badge: 'LIVE', badgeColor: 'bg-[#00E676] text-black' },
  { label: 'R2 Media Uploader', href: '/upload', icon: UploadCloud, badge: 'R2', badgeColor: 'bg-cyan-400 text-black' },
  { label: 'Dramas Catalog', href: '/dramas', icon: Film },
  { label: 'Add New Drama', href: '/dramas/new', icon: PlusCircle },
  { label: 'Episode Manager', href: '/episodes', icon: Tv },
  { label: 'Sync & Tools', href: '/tools', icon: Wrench },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Health check backend
    const checkHealth = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/dramas?limit=1`)
        .then((res) => setServerOnline(res.ok))
        .catch(() => setServerOnline(false));
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="w-64 shrink-0 bg-[#0E1118] border-r border-slate-800/80 hidden md:flex flex-col justify-between p-4 sticky top-0 h-screen z-30">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="px-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black italic tracking-tighter text-[#00E676] font-sans">
                Vionu
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Control Center & Media Studio</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#00E676] text-black shadow-lg shadow-[#00E676]/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Portal Link */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          {/* Server status */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
            <span className="text-slate-400 flex items-center gap-2 font-medium">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              API Server
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverOnline === true
                    ? 'bg-emerald-400 animate-pulse'
                    : serverOnline === false
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className={serverOnline ? 'text-emerald-400' : 'text-rose-400'}>
                {serverOnline === true ? 'Online (4000)' : serverOnline === false ? 'Offline' : 'Connecting'}
              </span>
            </span>
          </div>

          {/* User Website Link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-[#00E676] hover:bg-slate-800/40 transition-colors"
          >
            <span>Open User Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* ── MOBILE NAVBAR ── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0E1118] border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black italic text-[#00E676]">Vionu</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#00E676]/20 text-[#00E676]">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0E1118] border-b border-slate-800 p-4 space-y-2 z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold ${
                  isActive ? 'bg-[#00E676] text-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-400"
          >
            <span>Open User Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
