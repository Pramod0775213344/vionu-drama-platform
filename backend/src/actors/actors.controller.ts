import { Controller, Get, Param } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Actors')
@Controller('api/v1/actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @ApiOperation({ summary: 'Get all drama actors' })
  @Get()
  findAll() {
    return this.actorsService.findAll();
  }

  @ApiOperation({ summary: 'Get actor profile & drama filmography' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actorsService.findOne(id);
  }
}
