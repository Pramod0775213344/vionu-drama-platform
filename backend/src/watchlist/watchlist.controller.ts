import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Watchlist')
@Controller('api/v1/watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @ApiOperation({ summary: 'Get current user watchlist' })
  @Get()
  getUserWatchlist(@CurrentUser('id') userId: string) {
    return this.watchlistService.getUserWatchlist(userId);
  }

  @ApiOperation({ summary: 'Toggle drama in watchlist' })
  @Post(':dramaId/toggle')
  toggleWatchlist(@CurrentUser('id') userId: string, @Param('dramaId') dramaId: string) {
    return this.watchlistService.toggleWatchlist(userId, dramaId);
  }

  @ApiOperation({ summary: 'Check if drama is in user watchlist' })
  @Get(':dramaId/check')
  checkInWatchlist(@CurrentUser('id') userId: string, @Param('dramaId') dramaId: string) {
    return this.watchlistService.checkInWatchlist(userId, dramaId);
  }
}
