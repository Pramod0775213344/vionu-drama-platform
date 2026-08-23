import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string) {
    if (!q || q.trim().length === 0) {
      return { dramas: [], actors: [], genres: [] };
    }

    const searchTerm = q.trim();

    const [dramas, actors, genres] = await Promise.all([
      this.prisma.drama.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { originalTitle: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
        take: 12,
        include: {
          genres: { include: { genre: true } },
        },
      }),
      this.prisma.actor.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { originalName: { contains: searchTerm } },
          ],
        },
        take: 6,
      }),
      this.prisma.genre.findMany({
        where: {
          name: { contains: searchTerm },
        },
        take: 6,
      }),
    ]);

    return {
      dramas,
      actors,
      genres,
    };
  }
}
