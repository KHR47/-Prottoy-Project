import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HousingListing } from './entities/housing-listing.entity';
import { HousingReview } from './entities/housing-review.entity';
import { HousingService } from './housing.service';
import { HousingController } from './housing.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HousingListing, HousingReview]),
    NotificationsModule,
  ],
  controllers: [HousingController],
  providers: [HousingService],
  exports: [HousingService],
})
export class HousingModule {}
