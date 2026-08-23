import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Watch History')
@Controller('api/v1/history')
@UseGuards(JwtAuthGuard)
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @ApiOperation({ summary: 'Save video watch position telemetry' })
  @Post('progress')
  saveProgress(
    @CurrentUser('id') userId: string,
    @Body() dto: { episodeId: string; dramaId: string; progressSeconds: number; totalSeconds: number },
  ) {
    return this.watchHistoryService.saveProgress(userId, dto);
  }

  @ApiOperation({ summary: 'Get complete user watch history' })
  @Get()
  getUserHistory(@CurrentUser('id') userId: string) {
    return this.watchHistoryService.getUserHistory(userId);
  }

  @ApiOperation({ summary: 'Get continue watching feed' })
  @Get('continue-watching')
  getContinueWatching(@CurrentUser('id') userId: string) {
    return this.watchHistoryService.getContinueWatching(userId);
  }
}
