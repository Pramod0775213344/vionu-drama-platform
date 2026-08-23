import { Module } from '@nestjs/common';
import { DramasService } from './dramas.service';
import { DramasController } from './dramas.controller';

@Module({
  controllers: [DramasController],
  providers: [DramasService],
  exports: [DramasService],
})
export class DramasModule {}
