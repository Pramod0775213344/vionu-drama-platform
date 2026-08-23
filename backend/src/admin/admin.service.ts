import { Injectable, Logger } from '@nestjs/common';
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
      recentUsers,
      recentDramas,
    };
  }

  async createDrama(dto: {
    title: string;
    originalTitle: string;
    description: string;
    posterUrl?: string;
    backdropUrl?: string;
    releaseYear: number;
    status: 'ONGOING' | 'COMPLETED' | 'UPCOMING';
    totalEpisodes: number;
    runtimeMinutes: number;
    director?: string;
    screenwriter?: string;
    studio?: string;
    genreIds?: string[];
  }) {
    const slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let posterUrl = dto.posterUrl;
    let backdropUrl = dto.backdropUrl;

    // Fetch poster and backdrop automatically from TMDB if not provided
    if (!posterUrl || !backdropUrl) {
      const tmdbImages = await this.tmdbService.getDramaImages(dto.title);
      if (tmdbImages.posterUrl) posterUrl = tmdbImages.posterUrl;
      if (tmdbImages.backdropUrl) backdropUrl = tmdbImages.backdropUrl;
    }

    const drama = await this.prisma.drama.create({
      data: {
        title: dto.title,
        originalTitle: dto.originalTitle,
        slug,
        description: dto.description,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
        releaseYear: dto.releaseYear,
        status: dto.status,
        totalEpisodes: dto.totalEpisodes,
        runtimeMinutes: dto.runtimeMinutes,
        director: dto.director,
        screenwriter: dto.screenwriter,
        studio: dto.studio,
        genres: dto.genreIds
          ? {
              create: dto.genreIds.map((genreId) => ({ genreId })),
            }
          : undefined,
      },
    });

    // Create Season 1 by default
    await this.prisma.season.create({
      data: {
        dramaId: drama.id,
        seasonNumber: 1,
        title: 'Season 1',
        releaseYear: dto.releaseYear,
      },
    });

    return drama;
  }

  /**
   * Automatically query TMDB for all dramas in the database and update posterUrl / backdropUrl
   */
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

  async updateDrama(id: string, dto: any) {
    return this.prisma.drama.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDrama(id: string) {
    return this.prisma.drama.delete({
      where: { id },
    });
  }
}

