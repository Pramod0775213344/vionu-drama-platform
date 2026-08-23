import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(userId: string, dto: { dramaId: string; content: string; rating: number }) {
    const review = await this.prisma.review.upsert({
      where: {
        userId_dramaId: { userId, dramaId: dto.dramaId },
      },
      update: {
        content: dto.content,
        rating: dto.rating,
      },
      create: {
        userId,
        dramaId: dto.dramaId,
        content: dto.content,
        rating: dto.rating,
      },
    });

    // Update drama average rating
    const aggregates = await this.prisma.review.aggregate({
      where: { dramaId: dto.dramaId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.drama.update({
      where: { id: dto.dramaId },
      data: {
        averageRating: Number((aggregates._avg.rating || dto.rating).toFixed(1)),
        ratingCount: aggregates._count.rating || 1,
      },
    });

    return review;
  }

  async getDramaReviews(dramaId: string) {
    return this.prisma.review.findMany({
      where: { dramaId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
