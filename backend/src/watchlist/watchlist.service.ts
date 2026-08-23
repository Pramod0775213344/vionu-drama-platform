import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async getUserWatchlist(userId: string) {
    const list = await this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
      include: {
        drama: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    });

    return list.map((item) => item.drama);
  }

  async toggleWatchlist(userId: string, dramaId: string) {
    const existing = await this.prisma.watchlist.findUnique({
      where: {
        userId_dramaId: { userId, dramaId },
      },
    });

    if (existing) {
      await this.prisma.watchlist.delete({
        where: { id: existing.id },
      });
      return { added: false, message: 'Removed from watchlist' };
    } else {
      await this.prisma.watchlist.create({
        data: { userId, dramaId },
      });
      return { added: true, message: 'Added to watchlist' };
    }
  }

  async checkInWatchlist(userId: string, dramaId: string) {
    const existing = await this.prisma.watchlist.findUnique({
      where: {
        userId_dramaId: { userId, dramaId },
      },
    });
    return { inWatchlist: !!existing };
  }
}
