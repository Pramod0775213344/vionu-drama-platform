import { Controller, Get, Param, Query } from '@nestjs/common';
import { DramasService } from './dramas.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Dramas')
@Controller('api/v1/dramas')
export class DramasController {
  constructor(private readonly dramasService: DramasService) {}

  @ApiOperation({ summary: 'Get formatted home page sections' })
  @Get('home')
  getHomeSections() {
    return this.dramasService.getHomeSections();
  }

  @ApiOperation({ summary: 'List and filter dramas' })
  @Get()
  findAll(
    @Query('genre') genre?: string,
    @Query('year') year?: number,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('country') country?: string,
    @Query('isTrending') isTrending?: string,
  ) {
    return this.dramasService.findAll({ genre, year, status, sort, page, limit, country, isTrending });
  }

  @ApiOperation({ summary: 'Get detailed drama info by slug' })
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.dramasService.findBySlug(slug);
  }
}
