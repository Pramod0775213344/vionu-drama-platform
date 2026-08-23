import { CountryDramaPage } from '@/components/drama/CountryDramaPage';

export const metadata = {
  title: 'K-Drama | Vionu — Korean Dramas in Sinhala',
  description: 'Watch and download the best Korean Dramas with Sinhala subtitles on Vionu. Browse top-rated, trending, and latest K-Dramas.',
};

export default function KDramaPage() {
  return <CountryDramaPage country="KOREA" />;
}
