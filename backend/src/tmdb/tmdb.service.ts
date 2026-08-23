import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly apiKey = process.env.TMDB_API_KEY || 'e42e5d9c79ecf91a5e1eb2aa8bf3ff70'; // TMDB API Key
  private readonly tmdbBaseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  /**
   * Fetch poster and backdrop URLs for a given drama title from TMDB
   */
  async getDramaImages(title: string): Promise<{
    posterUrl: string | null;
    backdropUrl: string | null;
    overview?: string;
    voteAverage?: number;
    releaseDate?: string;
  }> {
    try {
      // 1. Clean title query (remove brackets or extra tags)
      const cleanQuery = title.replace(/\([^)]*\)/g, '').trim();
      const url = `${this.tmdbBaseUrl}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;

      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`TMDB API search failed for query: ${cleanQuery}`);
        return { posterUrl: null, backdropUrl: null };
      }

      const data = await response.json();
      const results = data.results || [];

      if (results.length === 0) {
        this.logger.warn(`No TMDB result found for: ${cleanQuery}`);
        return { posterUrl: null, backdropUrl: null };
      }

      // Pick best matching result with poster_path
      const item = results.find((r: any) => r.poster_path) || results[0];

      const posterUrl = item.poster_path ? `${this.imageBaseUrl}/w500${item.poster_path}` : null;
      const backdropUrl = item.backdrop_path ? `${this.imageBaseUrl}/w1284_and_h721_multi_faces${item.backdrop_path}` : posterUrl;

      return {
        posterUrl,
        backdropUrl,
        overview: item.overview,
        voteAverage: item.vote_average,
        releaseDate: item.first_air_date || item.release_date,
      };
    } catch (error) {
      this.logger.error(`Error fetching TMDB images for ${title}:`, error);
      return { posterUrl: null, backdropUrl: null };
    }
  }
}
