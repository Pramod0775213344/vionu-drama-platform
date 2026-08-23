import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EpisodesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const episode = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        drama: {
          include: {
            seasons: {
              include: {
                episodes: {
                  orderBy: { episodeNumber: 'asc' },
                },
              },
            },
          },
        },
        season: true,
      },
    });

    if (!episode) {
      throw new NotFoundException(`Episode with id '${id}' not found`);
    }

    return episode;
  }
}
