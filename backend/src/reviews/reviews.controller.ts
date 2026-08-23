import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Get all reviews for a drama' })
  @Get('drama/:dramaId')
  getDramaReviews(@Param('dramaId') dramaId: string) {
    return this.reviewsService.getDramaReviews(dramaId);
  }

  @ApiOperation({ summary: 'Submit or update drama review and rating' })
  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: { dramaId: string; content: string; rating: number },
  ) {
    return this.reviewsService.createReview(userId, dto);
  }
}
