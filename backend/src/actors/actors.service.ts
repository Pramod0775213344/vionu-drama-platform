import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.actor.findMany({
      include: {
        _count: { select: { dramas: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const actor = await this.prisma.actor.findUnique({
      where: { id },
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

    if (!actor) {
      throw new NotFoundException(`Actor with id '${id}' not found`);
    }

    return actor;
  }
}
