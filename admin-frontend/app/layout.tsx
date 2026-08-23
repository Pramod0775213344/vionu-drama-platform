import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AdminShell } from '@/components/AdminShell';

export const metadata: Metadata = {
  title: 'Vionu Admin Console | Media & Drama Management',
  description: 'Administrative platform for streaming metadata, TMDB auto-importer, episodes management, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090B0E] text-slate-100 min-h-screen antialiased">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
