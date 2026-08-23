export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt?: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  _count?: { dramas: number };
}

export interface Actor {
  id: string;
  name: string;
  originalName: string;
  photoUrl: string;
  bio?: string;
  birthDate?: string;
  dramas?: { drama: Drama; characterName: string; roleType: string }[];
}

export interface Episode {
  id: string;
  seasonId: string;
  dramaId: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  videoProvider: string;
  subtitleUrl?: string;
  downloadUrl?: string;
  durationSeconds: number;
  isPremium: boolean;
  releaseDate?: string;
  hasSinhalaSub?: boolean;
  downloadLinks?: {
    quality: string;
    resolution: string;
    size: string;
    url: string;
    subUrl?: string;
  }[];
}

export interface Season {
  id: string;
  dramaId: string;
  seasonNumber: number;
  title: string;
  releaseYear?: number;
  episodes: Episode[];
}

export interface Drama {
  id: string;
  title: string;
  originalTitle: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  releaseYear: number;
  status: 'ONGOING' | 'COMPLETED' | 'UPCOMING';
  totalEpisodes: number;
  runtimeMinutes: number;
  director?: string;
  screenwriter?: string;
  studio?: string;
  country?: 'KOREA' | 'CHINA';
  hasSinhalaSub?: boolean;
  translatorName?: string;
  averageRating: number;
  ratingCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  genres: { genre: Genre }[];
  actors?: { actor: Actor; characterName: string; roleType: string }[];
  seasons?: Season[];
  reviews?: Review[];
  relatedDramas?: Drama[];
}

export interface Review {
  id: string;
  userId: string;
  dramaId: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  dramaId: string;
  episodeId: string;
  progressSeconds: number;
  totalSeconds: number;
  completed: boolean;
  watchedAt: string;
  drama: Drama;
  episode: Episode;
}
