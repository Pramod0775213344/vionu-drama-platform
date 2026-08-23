import { Controller, Get, Param } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Episodes')
@Controller('api/v1/episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @ApiOperation({ summary: 'Get episode player metadata and season navigation' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.episodesService.findOne(id);
  }
}
