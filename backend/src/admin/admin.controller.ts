import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Get administrative platform analytics' })
  @Get('dashboard')
  getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @ApiOperation({ summary: 'Create a new Korean Drama' })
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

  @ApiOperation({ summary: 'Sync all drama posters with official TMDB images' })
  @Post('sync-tmdb')
  syncTmdbPosters() {
    return this.adminService.syncAllPostersWithTmdb();
  }
}

