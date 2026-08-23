import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchHistoryService {
  constructor(private prisma: PrismaService) {}

  async saveProgress(
    userId: string,
    dto: { episodeId: string; dramaId: string; progressSeconds: number; totalSeconds: number },
  ) {
    const completed = dto.progressSeconds / (dto.totalSeconds || 3600) >= 0.9;

    return this.prisma.watchHistory.upsert({
      where: {
        userId_episodeId: { userId, episodeId: dto.episodeId },
      },
      update: {
        progressSeconds: dto.progressSeconds,
        totalSeconds: dto.totalSeconds,
        completed,
        watchedAt: new Date(),
      },
      create: {
        userId,
        dramaId: dto.dramaId,
        episodeId: dto.episodeId,
        progressSeconds: dto.progressSeconds,
        totalSeconds: dto.totalSeconds,
        completed,
      },
    });
  }

  async getUserHistory(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
      include: {
        drama: {
          include: { genres: { include: { genre: true } } },
        },
        episode: true,
      },
    });
  }

  async getContinueWatching(userId: string) {
    return this.prisma.watchHistory.findMany({
      where: { userId, completed: false },
      orderBy: { watchedAt: 'desc' },
      take: 10,
      include: {
        drama: {
          include: { genres: { include: { genre: true } } },
        },
        episode: true,
      },
    });
  }
}
