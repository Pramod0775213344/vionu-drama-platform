import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TmdbService } from '../tmdb/tmdb.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private tmdbService: TmdbService,
  ) {}

  async getDashboardOverview() {
    const [
      totalUsers,
      totalDramas,
      totalEpisodes,
      totalReviews,
      totalWatchHistory,
      recentUsers,
      recentDramas,
      countryCounts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.drama.count(),
      this.prisma.episode.count(),
      this.prisma.review.count(),
      this.prisma.watchHistory.count(),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      this.prisma.drama.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, releaseYear: true, status: true, averageRating: true },
      }),
      this.prisma.drama.groupBy({
        by: ['country'],
        _count: { id: true },
      }),
    ]);

    const totalWatchTimeHours = Math.round((totalWatchHistory * 45) / 60);

    return {
      stats: {
        totalUsers,
        totalDramas,
        totalEpisodes,
        totalReviews,
        totalWatchTimeHours,
        activeSubscriptions: Math.round(totalUsers * 0.45),
        revenueEstimatedUsd: Math.round(totalUsers * 9.99),
      },
      countryCounts,
      recentUsers,
      recentDramas,
    };
  }

  async getDramas(query: { page?: number; limit?: number; search?: string; country?: string; status?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { originalTitle: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.country) {
      where.country = query.country;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [total, dramas] = await Promise.all([
      this.prisma.drama.count({ where }),
      this.prisma.drama.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: { include: { genre: true } },
          _count: { select: { episodes: true, reviews: true, watchlists: true } },
        },
      }),
    ]);

    return {
      data: dramas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDramaById(id: string) {
    const drama = await this.prisma.drama.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
        seasons: {
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' },
            },
          },
          orderBy: { seasonNumber: 'asc' },
        },
        episodes: {
          orderBy: { episodeNumber: 'asc' },
        },
      },
    });

    if (!drama) throw new NotFoundException(`Drama with ID ${id} not found`);
    return drama;
  }

  async createDrama(dto: {
    title: string;
    originalTitle?: string;
    description: string;
    posterUrl?: string;
    backdropUrl?: string;
    releaseYear?: number;
    status?: string;
    totalEpisodes?: number;
    runtimeMinutes?: number;
    director?: string;
    screenwriter?: string;
    studio?: string;
    country?: string;
    hasSinhalaSub?: boolean;
    translatorName?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    genreIds?: string[];
    defaultVideoUrl?: string;
    autoCreateEpisodes?: boolean;
  }) {
    let slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ensure slug uniqueness
    const existing = await this.prisma.drama.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let posterUrl = dto.posterUrl;
    let backdropUrl = dto.backdropUrl;

    if (!posterUrl || !backdropUrl) {
      const tmdbImages = await this.tmdbService.getDramaImages(dto.title);
      if (!posterUrl && tmdbImages.posterUrl) posterUrl = tmdbImages.posterUrl;
      if (!backdropUrl && tmdbImages.backdropUrl) backdropUrl = tmdbImages.backdropUrl;
    }

    const totalEpisodes = dto.totalEpisodes || 16;
    const releaseYear = dto.releaseYear || new Date().getFullYear();

    const drama = await this.prisma.drama.create({
      data: {
        title: dto.title,
        originalTitle: dto.originalTitle || dto.title,
        slug,
        description: dto.description || 'No description available.',
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
        releaseYear,
        status: dto.status || 'COMPLETED',
        totalEpisodes,
        runtimeMinutes: dto.runtimeMinutes || 60,
        director: dto.director,
        screenwriter: dto.screenwriter,
        studio: dto.studio || 'Vionu Studio',
        country: dto.country || 'KOREA',
        hasSinhalaSub: dto.hasSinhalaSub !== undefined ? dto.hasSinhalaSub : true,
        translatorName: dto.translatorName || 'Vionu Sinhala Team',
        isFeatured: dto.isFeatured || false,
        isTrending: dto.isTrending || false,
        genres: dto.genreIds && dto.genreIds.length > 0
          ? {
              create: dto.genreIds.map((genreId) => ({ genreId })),
            }
          : undefined,
      },
    });

    // Create Season 1
    const season = await this.prisma.season.create({
      data: {
        dramaId: drama.id,
        seasonNumber: 1,
        title: 'Season 1',
        releaseYear,
      },
    });

    // Auto-create episodes if requested
    if (dto.autoCreateEpisodes) {
      const defaultVideoUrl = dto.defaultVideoUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
      const episodesData = [];
      for (let i = 1; i <= totalEpisodes; i++) {
        episodesData.push({
          dramaId: drama.id,
          seasonId: season.id,
          episodeNumber: i,
          title: `Episode ${i}`,
          description: `${drama.title} - Episode ${i}`,
          thumbnailUrl: backdropUrl || posterUrl || '',
          videoUrl: defaultVideoUrl,
          videoProvider: 'CLOUDFLARE_R2',
          durationSeconds: (dto.runtimeMinutes || 60) * 60,
        });
      }
      await this.prisma.episode.createMany({ data: episodesData });
    }

    return drama;
  }

  async updateDrama(id: string, dto: any) {
    const { genreIds, ...rest } = dto;

    if (genreIds) {
      // Clear existing genres and reconnect new ones
      await this.prisma.dramaGenre.deleteMany({ where: { dramaId: id } });
      if (genreIds.length > 0) {
        await this.prisma.dramaGenre.createMany({
          data: genreIds.map((genreId: string) => ({ dramaId: id, genreId })),
        });
      }
    }

    return this.prisma.drama.update({
      where: { id },
      data: rest,
      include: {
        genres: { include: { genre: true } },
      },
    });
  }

  async deleteDrama(id: string) {
    return this.prisma.drama.delete({
      where: { id },
    });
  }

  async getGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getEpisodes(dramaId?: string) {
    const where: any = {};
    if (dramaId) where.dramaId = dramaId;

    return this.prisma.episode.findMany({
      where,
      orderBy: { episodeNumber: 'asc' },
      include: { drama: { select: { id: true, title: true } } },
    });
  }

  async createEpisode(dto: {
    dramaId: string;
    seasonId?: string;
    episodeNumber: number;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl: string;
    videoProvider?: string;
    subtitleUrl?: string;
    downloadUrl?: string;
    durationSeconds?: number;
    isPremium?: boolean;
    releaseDate?: string;
  }) {
    let seasonId = dto.seasonId;
    if (!seasonId) {
      const season = await this.prisma.season.findFirst({
        where: { dramaId: dto.dramaId },
      });
      if (season) {
        seasonId = season.id;
      } else {
        const newSeason = await this.prisma.season.create({
          data: {
            dramaId: dto.dramaId,
            seasonNumber: 1,
            title: 'Season 1',
          },
        });
        seasonId = newSeason.id;
      }
    }

    return this.prisma.episode.create({
      data: {
        dramaId: dto.dramaId,
        seasonId: seasonId!,
        episodeNumber: dto.episodeNumber,
        title: dto.title || `Episode ${dto.episodeNumber}`,
        description: dto.description || '',
        thumbnailUrl: dto.thumbnailUrl || '',
        videoUrl: dto.videoUrl,
        videoProvider: dto.videoProvider || 'CLOUDFLARE_R2',
        subtitleUrl: dto.subtitleUrl,
        downloadUrl: dto.downloadUrl,
        durationSeconds: dto.durationSeconds || 3600,
        isPremium: dto.isPremium || false,
        releaseDate: dto.releaseDate,
      },
    });
  }

  async updateEpisode(id: string, dto: any) {
    return this.prisma.episode.update({
      where: { id },
      data: dto,
    });
  }

  async deleteEpisode(id: string) {
    return this.prisma.episode.delete({
      where: { id },
    });
  }

  async bulkCreateEpisodes(dto: { dramaId: string; count: number; templateVideoUrl?: string }) {
    const count = Number(dto.count) || 16;
    const defaultVideoUrl = dto.templateVideoUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    const drama = await this.prisma.drama.findUnique({ where: { id: dto.dramaId } });
    if (!drama) throw new NotFoundException('Drama not found');

    let season = await this.prisma.season.findFirst({ where: { dramaId: dto.dramaId } });
    if (!season) {
      season = await this.prisma.season.create({
        data: { dramaId: dto.dramaId, seasonNumber: 1, title: 'Season 1' },
      });
    }

    // Delete existing episodes if any
    await this.prisma.episode.deleteMany({ where: { dramaId: dto.dramaId } });

    const episodesData = [];
    for (let i = 1; i <= count; i++) {
      episodesData.push({
        dramaId: dto.dramaId,
        seasonId: season.id,
        episodeNumber: i,
        title: `Episode ${i}`,
        description: `${drama.title} - Episode ${i}`,
        thumbnailUrl: drama.backdropUrl || drama.posterUrl || '',
        videoUrl: defaultVideoUrl,
        videoProvider: 'CLOUDFLARE_R2',
        durationSeconds: (drama.runtimeMinutes || 60) * 60,
      });
    }

    await this.prisma.episode.createMany({ data: episodesData });
    await this.prisma.drama.update({ where: { id: dto.dramaId }, data: { totalEpisodes: count } });

    return { message: `Successfully created ${count} episodes for ${drama.title}`, count };
  }

  async searchTmdb(query: string, type: 'tv' | 'movie' = 'tv') {
    return this.tmdbService.search(query, type);
  }

  async getTmdbDetails(id: number, type: 'tv' | 'movie' = 'tv') {
    return this.tmdbService.getDetails(id, type);
  }

  async importFromTmdb(dto: {
    tmdbId: number;
    mediaType?: 'tv' | 'movie';
    customCountry?: string;
    hasSinhalaSub?: boolean;
    translatorName?: string;
    isTrending?: boolean;
    isFeatured?: boolean;
    defaultVideoUrl?: string;
    autoCreateEpisodes?: boolean;
  }) {
    const type = dto.mediaType || 'tv';
    const details = await this.tmdbService.getDetails(dto.tmdbId, type);
    if (!details) {
      throw new NotFoundException(`TMDB item with ID ${dto.tmdbId} not found`);
    }

    // Find or create matching genres
    const genreIds: string[] = [];
    if (details.genres && details.genres.length > 0) {
      for (const genreName of details.genres) {
        const slug = genreName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let genre = await this.prisma.genre.findUnique({ where: { slug } });
        if (!genre) {
          genre = await this.prisma.genre.create({ data: { name: genreName, slug } });
        }
        genreIds.push(genre.id);
      }
    }

    // Create Drama
    const createdDrama = await this.createDrama({
      title: details.title,
      originalTitle: details.originalTitle,
      description: details.overview,
      posterUrl: details.posterUrl || undefined,
      backdropUrl: details.backdropUrl || undefined,
      releaseYear: details.releaseYear,
      status: details.status,
      totalEpisodes: details.totalEpisodes,
      runtimeMinutes: details.runtimeMinutes,
      director: details.director,
      screenwriter: details.screenwriter,
      studio: details.studio,
      country: dto.customCountry || details.country || 'KOREA',
      hasSinhalaSub: dto.hasSinhalaSub !== undefined ? dto.hasSinhalaSub : true,
      translatorName: dto.translatorName || 'Vionu Sinhala Team',
      isTrending: dto.isTrending || false,
      isFeatured: dto.isFeatured || false,
      genreIds,
      defaultVideoUrl: dto.defaultVideoUrl,
      autoCreateEpisodes: dto.autoCreateEpisodes !== undefined ? dto.autoCreateEpisodes : true,
    });

    // Create Actors if available
    if (details.actors && details.actors.length > 0) {
      for (const act of details.actors) {
        let actor = await this.prisma.actor.findFirst({ where: { name: act.name } });
        if (!actor) {
          actor = await this.prisma.actor.create({
            data: {
              name: act.name,
              originalName: act.originalName,
              photoUrl: act.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            },
          });
        }
        await this.prisma.dramaActor.create({
          data: {
            dramaId: createdDrama.id,
            actorId: actor.id,
            characterName: act.characterName || 'Main Cast',
          },
        }).catch(() => {});
      }
    }

    return createdDrama;
  }

  async syncAllPostersWithTmdb() {
    const dramas = await this.prisma.drama.findMany();
    let updatedCount = 0;
    const results: Array<{ title: string; updated: boolean; posterUrl?: string }> = [];

    for (const drama of dramas) {
      const images = await this.tmdbService.getDramaImages(drama.title);
      if (images.posterUrl || images.backdropUrl) {
        await this.prisma.drama.update({
          where: { id: drama.id },
          data: {
            posterUrl: images.posterUrl || drama.posterUrl,
            backdropUrl: images.backdropUrl || drama.backdropUrl,
          },
        });
        updatedCount++;
        results.push({ title: drama.title, updated: true, posterUrl: images.posterUrl || drama.posterUrl });
      } else {
        results.push({ title: drama.title, updated: false });
      }
    }

    this.logger.log(`Synced TMDB posters for ${updatedCount}/${dramas.length} dramas.`);
    return {
      message: `Synced TMDB posters for ${updatedCount} dramas.`,
      totalSynced: updatedCount,
      results,
    };
  }
}
