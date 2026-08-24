import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly apiKey = process.env.TMDB_API_KEY || 'eba1a5af8ad4791a83320bfc40dd76c4';
  private readonly tmdbBaseUrl = 'https://api.themoviedb.org/3';
  private readonly imageBaseUrl = 'https://image.tmdb.org/t/p';

  /**
   * Search TMDB for TV shows or movies
   */
  async search(query: string, type: 'tv' | 'movie' = 'tv') {
    try {
      const cleanQuery = query.replace(/\([^)]*\)/g, '').trim();
      const url = `${this.tmdbBaseUrl}/search/${type}?api_key=${this.apiKey}&query=${encodeURIComponent(cleanQuery)}&include_adult=false`;

      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`TMDB search failed: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const results = data.results || [];

      return results.map((item: any) => {
        const countryCode = item.origin_country?.[0] || '';
        let country = 'KOREA';
        if (countryCode === 'CN' || countryCode === 'TW' || countryCode === 'HK') country = 'CHINA';
        else if (countryCode === 'JP') country = 'JAPAN';
        else if (countryCode === 'TH') country = 'THAILAND';
        else if (countryCode && countryCode !== 'KR') country = 'OTHER';

        const releaseDate = item.first_air_date || item.release_date || '';
        const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();

        return {
          id: item.id,
          title: item.name || item.title || '',
          originalTitle: item.original_name || item.original_title || item.name || item.title || '',
          overview: item.overview || '',
          posterUrl: item.poster_path ? `${this.imageBaseUrl}/w500${item.poster_path}` : null,
          backdropUrl: item.backdrop_path ? `${this.imageBaseUrl}/w1284_and_h721_multi_faces${item.backdrop_path}` : null,
          releaseYear,
          voteAverage: Math.round((item.vote_average || 0) * 10) / 10,
          mediaType: type,
          country,
        };
      });
    } catch (error) {
      this.logger.error(`Error searching TMDB for ${query}:`, error);
      return [];
    }
  }

  /**
   * Fetch full details for a TMDB item (cast, crew, networks, seasons, runtime)
   */
  async getDetails(id: number, type: 'tv' | 'movie' = 'tv') {
    try {
      const url = `${this.tmdbBaseUrl}/${type}/${id}?api_key=${this.apiKey}&append_to_response=credits,keywords`;
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const credits = data.credits || {};

      const director = credits.crew?.find((c: any) => c.job === 'Director' || c.job === 'Executive Producer')?.name || '';
      const screenwriter = credits.crew?.find((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Creator')?.name || '';
      const studio = data.networks?.[0]?.name || data.production_companies?.[0]?.name || 'Vionu Studio';

      const countryCode = data.origin_country?.[0] || data.production_countries?.[0]?.iso_3166_1 || '';
      let country = 'KOREA';
      if (countryCode === 'CN' || countryCode === 'TW' || countryCode === 'HK') country = 'CHINA';
      else if (countryCode === 'JP') country = 'JAPAN';
      else if (countryCode === 'TH') country = 'THAILAND';
      else if (countryCode && countryCode !== 'KR') country = 'OTHER';

      const releaseDate = data.first_air_date || data.release_date || '';
      const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear();

      const runtimeMinutes = (data.episode_run_time && data.episode_run_time[0]) || data.runtime || 60;
      const totalEpisodes = data.number_of_episodes || (type === 'movie' ? 1 : 16);

      const genres = (data.genres || []).map((g: any) => g.name);

      const actors = (credits.cast || []).slice(0, 6).map((c: any) => ({
        name: c.name,
        originalName: c.original_name || c.name,
        characterName: c.character || 'Main Role',
        photoUrl: c.profile_path ? `${this.imageBaseUrl}/w500${c.profile_path}` : null,
      }));

      return {
        id: data.id,
        title: data.name || data.title || '',
        originalTitle: data.original_name || data.original_title || data.name || data.title || '',
        overview: data.overview || '',
        posterUrl: data.poster_path ? `${this.imageBaseUrl}/w500${data.poster_path}` : null,
        backdropUrl: data.backdrop_path ? `${this.imageBaseUrl}/w1284_and_h721_multi_faces${data.backdrop_path}` : null,
        releaseYear,
        status: data.status === 'Ended' ? 'COMPLETED' : 'ONGOING',
        totalEpisodes,
        runtimeMinutes,
        director,
        screenwriter,
        studio,
        country,
        voteAverage: Math.round((data.vote_average || 0) * 10) / 10,
        genres,
        actors,
      };
    } catch (error) {
      this.logger.error(`Error fetching TMDB details for ${id}:`, error);
      return null;
    }
  }

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
