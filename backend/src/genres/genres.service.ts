import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        _count: {
          select: { dramas: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        dramas: {
          include: {
            drama: {
              include: {
                genres: { include: { genre: true } },
              },
            },
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with slug '${slug}' not found`);
    }

    return {
      ...genre,
      dramas: genre.dramas.map((d) => d.drama),
    };
  }
}
