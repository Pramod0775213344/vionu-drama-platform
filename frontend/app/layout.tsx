import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export const metadata: Metadata = {
  title: 'Vionu | Watch Korean Dramas Online in HD',
  description: 'Discover and stream high quality Korean Dramas, browse trending titles, actors, episodes, and maintain your personal watchlist on Vionu.',
  keywords: ['Kdrama', 'Korean Drama', 'Stream Kdrama', 'Queen of Tears', 'Crash Landing on You', 'Viki', 'Netflix Kdrama'],
  openGraph: {
    title: 'Vionu | Korean Drama Streaming Platform',
    description: 'Discover, search, and watch your favorite Korean Dramas in HD.',
    siteName: 'Vionu',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0E1015] text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 pt-14 sm:pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

