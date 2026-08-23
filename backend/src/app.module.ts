import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DramasModule } from './dramas/dramas.module';
import { GenresModule } from './genres/genres.module';
import { ActorsModule } from './actors/actors.module';
import { EpisodesModule } from './episodes/episodes.module';
import { SearchModule } from './search/search.module';
import { WatchlistModule } from './watchlist/watchlist.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DramasModule,
    GenresModule,
    ActorsModule,
    EpisodesModule,
    SearchModule,
    WatchlistModule,
    WatchHistoryModule,
    ReviewsModule,
    AdminModule,
    TmdbModule,
    StorageModule,
  ],
})
export class AppModule {}

