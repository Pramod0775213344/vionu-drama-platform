import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-[#10121A] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-[#00E676] tracking-tighter italic">Vionu</span>
              <span className="bg-[#00E676] text-black text-[9px] font-black px-1.5 py-0.5 rounded">
                සිංහල SUB
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              කොරියානු සහ චීන කතාමාලා (K-Dramas & C-Dramas) සිංහල උපසිරැසි සමඟ Full HD නරඹන්න සහ 1080p, 720p ඍජුවම Download කරගන්න.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Browse & Watch</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-[#00E676] transition-colors">For You (Home)</Link></li>
              <li><Link href="/dramas?trending=true" className="hover:text-[#00E676] transition-colors">Trending Dramas</Link></li>
              <li><Link href="/dramas?country=KOREA" className="hover:text-[#00E676] transition-colors">Korean Dramas (K-Dramas)</Link></li>
              <li><Link href="/dramas?country=CHINA" className="hover:text-[#00E676] transition-colors">Chinese Dramas (C-Dramas)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Download Quality</h4>
            <ul className="space-y-2">
              <li className="text-[#00E676] font-bold">⚡ 1080p Ultra HD Direct Links</li>
              <li className="text-slate-300">⚡ 720p HD Fast Server Links</li>
              <li className="text-slate-400">⚡ 480p SD Mobile Compressed</li>
              <li className="text-slate-300">⚡ Sinhala Subtitle (.SRT) Files</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform & Help</h4>
            <ul className="space-y-2">
              <li><Link href="/history" className="hover:text-[#00E676] transition-colors">Watch History</Link></li>
              <li><Link href="/watchlist" className="hover:text-[#00E676] transition-colors">My Watchlist</Link></li>
              <li><Link href="/terms" className="hover:text-[#00E676] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#00E676] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 Vionu Asian Drama Platform - Sinhala Subtitle Hub. All rights reserved.</p>
          <p className="text-slate-400 font-semibold">
            Enjoy the Best Asian Drama Streaming Experience.
          </p>
        </div>
      </div>
    </footer>
  );
};

