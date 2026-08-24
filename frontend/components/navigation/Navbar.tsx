'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User as UserIcon, LogOut, Menu, X, ChevronDown, Film, Star } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchApi } from '@/lib/api';

export const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, initFromStorage, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ── Live suggestion state ──
  const [suggestions, setSuggestions] = useState<{ dramas: any[]; actors: any[] }>({ dramas: [], actors: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // ── Debounced live search ──
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions({ dramas: [], actors: [] });
      setShowSuggestions(false);
      return;
    }
    setSugLoading(true);
    try {
      const res = await fetchApi<{ dramas: any[]; actors: any[]; genres: any[] }>(
        `/search?q=${encodeURIComponent(q.trim())}`
      );
      setSuggestions({ dramas: res.dramas?.slice(0, 5) || [], actors: res.actors?.slice(0, 3) || [] });
      setShowSuggestions(true);
    } catch {
      setSuggestions({ dramas: [], actors: [] });
    } finally {
      setSugLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSuggestionClick = (slug: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(`/korean-dramas/${slug}`);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    initFromStorage();
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initFromStorage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-[#0E1015]/95 backdrop-blur-md py-3 shadow-[0_8px_30px_rgba(0,0,0,0.85)]'
          : 'bg-gradient-to-b from-[#0E1015] via-[#0E1015]/60 to-transparent py-3'
      }`}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left Brand Logo & Primary Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* iQIYI Style Brand Logo */}
            <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
              <span className="text-2xl sm:text-3xl font-black text-[#00E676] tracking-tighter hover:scale-105 transition-transform italic font-sans">
                Vionu
              </span>
            </Link>

            {/* Main Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-200">
              <Link href="/" className="text-white hover:text-[#00E676] transition-colors">
                For You
              </Link>
              <Link href="/dramas" className="text-slate-300 hover:text-[#00E676] transition-colors">
                Trending
              </Link>
              <Link href="/c-drama" className="text-slate-300 hover:text-[#00E676] transition-colors flex items-center gap-1">
                <span>C-Drama</span>
              </Link>
              <Link href="/k-drama" className="text-slate-300 hover:text-[#00E676] transition-colors flex items-center gap-1">
                <span>K-Drama</span>
              </Link>
            </nav>
          </div>

          {/* Right Controls: Search + User Profile */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Live Search Bar */}
            <div ref={searchRef} className="relative hidden md:block w-48 lg:w-72">
              <form onSubmit={handleSearchSubmit} className="flex items-center relative">
                <input
                  type="text"
                  placeholder="Search dramas, actors..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  className="w-full bg-[#202431] border border-slate-700/60 text-white text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676] transition-all placeholder:text-slate-500 font-medium"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-[#00E676] transition-colors">
                  {sugLoading
                    ? <div className="w-3.5 h-3.5 border-2 border-[#00E676]/40 border-t-[#00E676] rounded-full animate-spin" />
                    : <Search className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* ── SUGGESTION DROPDOWN ── */}
              {showSuggestions && (suggestions.dramas.length > 0 || suggestions.actors.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#14161D] border border-slate-700/60 rounded-xl shadow-2xl z-[100] overflow-hidden">

                  {/* Drama results */}
                  {suggestions.dramas.length > 0 && (
                    <div>
                      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5">
                        <Film className="w-3 h-3 text-[#00E676]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Dramas</span>
                      </div>
                      {suggestions.dramas.map((d: any) => (
                        <button
                          key={d.id}
                          onClick={() => handleSuggestionClick(d.slug)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#00E676]/8 transition-colors group text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={d.posterUrl}
                            alt={d.title}
                            className="w-8 h-11 object-cover rounded shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white group-hover:text-[#00E676] transition-colors truncate">
                              {d.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-slate-500">{d.releaseYear}</span>
                              <span className="text-[9px] text-slate-600">·</span>
                              <span className="text-[9px] text-slate-500">{d.totalEpisodes} Eps</span>
                              {d.averageRating > 0 && (
                                <span className="flex items-center gap-0.5 ml-auto">
                                  <Star className="w-2.5 h-2.5 fill-[#00E676] text-[#00E676]" />
                                  <span className="text-[9px] text-[#00E676] font-bold">{d.averageRating.toFixed(1)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                            d.country === 'CHINA' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#00E676]/20 text-[#00E676]'
                          }`}>
                            {d.country === 'CHINA' ? 'C-Drama' : 'K-Drama'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actors */}
                  {suggestions.actors.length > 0 && (
                    <div className="border-t border-slate-800">
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Actors</span>
                      </div>
                      {suggestions.actors.map((a: any) => (
                        <Link
                          key={a.id}
                          href={`/actors/${a.id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#00E676]/8 transition-colors group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.photoUrl} alt={a.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" />
                          <span className="text-xs font-medium text-slate-300 group-hover:text-[#00E676] transition-colors truncate">
                            {a.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* View all results link */}
                  <div className="border-t border-slate-800 px-3 py-2">
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="text-[10px] text-[#00E676] hover:underline font-bold flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      View all results for &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown / Login Button */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  onClick={() => setShowUserMenu(p => !p)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-[#00E676] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#00E676]/20 border border-[#00E676]/50 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-[#00E676]" />
                  </div>
                  <span className="text-[11px] font-semibold max-w-[60px] truncate">
                    {user?.name?.split(' ')[0] || 'Me'}
                  </span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-44 bg-[#14161D] border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs font-extrabold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-[#00E676] hover:bg-[#00E676]/5 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full border border-[#00E676]/60 text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" /> Login
              </Link>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded bg-[#181B26]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#14161D] border-t border-slate-800 mt-2 px-4 py-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search dramas, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#202431] border border-slate-700 text-white text-sm rounded pl-9 pr-4 py-2"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <Link href="/" className="py-2 text-slate-200 hover:text-[#00E676]" onClick={() => setIsMobileMenuOpen(false)}>
              For You
            </Link>
            <Link href="/dramas?trending=true" className="py-2 text-slate-200 hover:text-[#00E676]" onClick={() => setIsMobileMenuOpen(false)}>
              Trending
            </Link>
            <Link href="/dramas?country=KOREA" className="py-2 text-slate-200 hover:text-[#00E676]" onClick={() => setIsMobileMenuOpen(false)}>
              Korean Dramas
            </Link>
            <Link href="/dramas?country=CHINA" className="py-2 text-slate-200 hover:text-[#00E676]" onClick={() => setIsMobileMenuOpen(false)}>
              Chinese Dramas
            </Link>
            <Link href="/history" className="py-2 text-slate-200 hover:text-[#00E676]" onClick={() => setIsMobileMenuOpen(false)}>
              Watch History
            </Link>
            <Link href="/dramas?sub=sinhala" className="py-2 text-[#00E676] font-bold" onClick={() => setIsMobileMenuOpen(false)}>
              Sinhala Subbed ⚡
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

