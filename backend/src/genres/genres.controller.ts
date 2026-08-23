import { Controller, Get, Param } from '@nestjs/common';
import { GenresService } from './genres.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Genres')
@Controller('api/v1/genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @ApiOperation({ summary: 'Get all drama genres' })
  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  @ApiOperation({ summary: 'Get genre details with associated dramas' })
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.genresService.findBySlug(slug);
  }
}
