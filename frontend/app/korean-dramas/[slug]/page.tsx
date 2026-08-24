import React from 'react';
import { notFound } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Drama } from '@/types';
import { DramaDetailView } from '@/components/drama/DramaDetailView';

export const dynamic = 'force-dynamic';

async function getDramaDetails(slug: string): Promise<Drama | null> {
  try {
    return await fetchApi<Drama>(`/dramas/${slug}`, { next: { revalidate: 30 } } as any);
  } catch (error) {
    console.error(`Failed to fetch drama details for ${slug}:`, error);
    return null;
  }
}

export default async function DramaDetailPage({ params }: { params: { slug: string } }) {
  const drama = await getDramaDetails(params.slug);

  if (!drama) {
    notFound();
  }

  return <DramaDetailView drama={drama} />;
}
