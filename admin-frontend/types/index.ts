export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Actor {
  id: string;
  name: string;
  originalName: string;
  photoUrl: string;
  bio?: string;
  birthDate?: string;
}

export interface DramaActor {
  dramaId: string;
  actorId: string;
  characterName: string;
  roleType: string;
  actor: Actor;
}

export interface DramaGenre {
  dramaId: string;
  genreId: string;
  genre: Genre;
}

export interface Season {
  id: string;
  dramaId: string;
  seasonNumber: number;
  title: string;
  releaseYear?: number;
  episodes?: Episode[];
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
  createdAt: string;
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
  status: 'COMPLETED' | 'ONGOING' | 'UPCOMING';
  totalEpisodes: number;
  runtimeMinutes: number;
  director?: string;
  screenwriter?: string;
  studio?: string;
  country?: string;
  hasSinhalaSub: boolean;
  translatorName?: string;
  averageRating: number;
  ratingCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
  genres?: DramaGenre[];
  actors?: DramaActor[];
  seasons?: Season[];
  episodes?: Episode[];
  _count?: {
    episodes: number;
    reviews?: number;
    watchlists?: number;
  };
}

export interface TmdbItem {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number;
  voteAverage: number;
  mediaType: 'tv' | 'movie';
  country: string;
}
