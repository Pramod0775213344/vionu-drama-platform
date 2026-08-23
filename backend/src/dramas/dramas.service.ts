import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DramasService {
  constructor(private prisma: PrismaService) {}

  async getHomeSections() {
    const featured = await this.prisma.drama.findFirst({
      where: { isFeatured: true },
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
      },
    });

    const trending = await this.prisma.drama.findMany({
      where: { isTrending: true },
      take: 10,
      include: { genres: { include: { genre: true } } },
      orderBy: { averageRating: 'desc' },
    });

    const popular = await this.prisma.drama.findMany({
      take: 10,
      include: { genres: { include: { genre: true } } },
      orderBy: { ratingCount: 'desc' },
    });

    const latest = await this.prisma.drama.findMany({
      take: 10,
      include: { genres: { include: { genre: true } } },
      orderBy: { releaseYear: 'desc' },
    });

    const topRated = await this.prisma.drama.findMany({
      take: 10,
      include: { genres: { include: { genre: true } } },
      orderBy: { averageRating: 'desc' },
    });

    const romance = await this.prisma.drama.findMany({
      where: {
        genres: {
          some: {
            genre: {
              slug: 'romance',
            },
          },
        },
      },
      take: 10,
      include: { genres: { include: { genre: true } } },
    });

    const action = await this.prisma.drama.findMany({
      where: {
        genres: {
          some: {
            genre: {
              slug: 'action',
            },
          },
        },
      },
      take: 10,
      include: { genres: { include: { genre: true } } },
    });

    return {
      featured: featured || popular[0] || null,
      trending,
      popular,
      latest,
      topRated,
      romance,
      action,
    };
  }

  async findAll(query: {
    genre?: string;
    year?: number;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
    country?: string;
    isTrending?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.country) {
      where.country = query.country.toUpperCase();
    }

    if (query.isTrending === 'true') {
      where.isTrending = true;
    }

    if (query.genre) {
      where.genres = {
        some: {
          genre: {
            slug: query.genre.toLowerCase(),
          },
        },
      };
    }

    if (query.year) {
      where.releaseYear = Number(query.year);
    }

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    let orderBy: any = { createdAt: 'desc' };

    if (query.sort === 'popular') {
      orderBy = { ratingCount: 'desc' };
    } else if (query.sort === 'rating') {
      orderBy = { averageRating: 'desc' };
    } else if (query.sort === 'latest') {
      orderBy = { releaseYear: 'desc' };
    } else if (query.sort === 'title_asc') {
      orderBy = { title: 'asc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.drama.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: { include: { genre: true } },
        },
      }),
      this.prisma.drama.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const drama = await this.prisma.drama.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        actors: { include: { actor: true } },
        seasons: {
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' },
            },
          },
        },
        reviews: {
          take: 5,
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
        },
      },
    });

    if (!drama) {
      throw new NotFoundException(`Drama with slug '${slug}' not found`);
    }

    const relatedDramas = await this.prisma.drama.findMany({
      where: {
        id: { not: drama.id },
        genres: {
          some: {
            genreId: {
              in: drama.genres.map((g) => g.genreId),
            },
          },
        },
      },
      take: 6,
      include: { genres: { include: { genre: true } } },
    });

    return {
      ...drama,
      relatedDramas,
    };
  }
}
