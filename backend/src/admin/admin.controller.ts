import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get administrative platform analytics' })
  @Get('dashboard')
  getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @ApiOperation({ summary: 'List all dramas with search and filter' })
  @Get('dramas')
  getDramas(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDramas({ page, limit, search, country, status });
  }

  @ApiOperation({ summary: 'Get single drama by ID with seasons and episodes' })
  @Get('dramas/:id')
  getDramaById(@Param('id') id: string) {
    return this.adminService.getDramaById(id);
  }

  @ApiOperation({ summary: 'Create a new Korean / Asian Drama' })
  @Post('dramas')
  createDrama(@Body() dto: any) {
    return this.adminService.createDrama(dto);
  }

  @ApiOperation({ summary: 'Update existing drama' })
  @Patch('dramas/:id')
  updateDrama(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateDrama(id, dto);
  }

  @ApiOperation({ summary: 'Delete drama' })
  @Delete('dramas/:id')
  deleteDrama(@Param('id') id: string) {
    return this.adminService.deleteDrama(id);
  }

  @ApiOperation({ summary: 'Get all available genres' })
  @Get('genres')
  getGenres() {
    return this.adminService.getGenres();
  }

  @ApiOperation({ summary: 'Get episodes list (optionally filtered by dramaId)' })
  @Get('episodes')
  getEpisodes(@Query('dramaId') dramaId?: string) {
    return this.adminService.getEpisodes(dramaId);
  }

  @ApiOperation({ summary: 'Create single episode' })
  @Post('episodes')
  createEpisode(@Body() dto: any) {
    return this.adminService.createEpisode(dto);
  }

  @ApiOperation({ summary: 'Update episode' })
  @Patch('episodes/:id')
  updateEpisode(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateEpisode(id, dto);
  }

  @ApiOperation({ summary: 'Delete episode' })
  @Delete('episodes/:id')
  deleteEpisode(@Param('id') id: string) {
    return this.adminService.deleteEpisode(id);
  }

  @ApiOperation({ summary: 'Bulk generate episodes for drama' })
  @Post('episodes/bulk')
  bulkCreateEpisodes(@Body() dto: any) {
    return this.adminService.bulkCreateEpisodes(dto);
  }

  @ApiOperation({ summary: 'Search TMDB database for Asian dramas and movies' })
  @Get('tmdb/search')
  searchTmdb(@Query('q') query: string, @Query('type') type?: 'tv' | 'movie') {
    return this.adminService.searchTmdb(query, type);
  }

  @ApiOperation({ summary: 'Get full details for a TMDB item' })
  @Get('tmdb/details/:id')
  getTmdbDetails(@Param('id') id: string, @Query('type') type?: 'tv' | 'movie') {
    return this.adminService.getTmdbDetails(Number(id), type);
  }

  @ApiOperation({ summary: '1-Click auto-import drama from TMDB' })
  @Post('tmdb/import')
  importFromTmdb(@Body() dto: any) {
    return this.adminService.importFromTmdb(dto);
  }

  @ApiOperation({ summary: 'Sync all drama posters with official TMDB images' })
  @Post('sync-tmdb')
  syncTmdbPosters() {
    return this.adminService.syncAllPostersWithTmdb();
  }
}
