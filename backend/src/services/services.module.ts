import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceListing } from './entities/service-listing.entity';
import { ServiceReview } from './entities/service-review.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceListing, ServiceReview]),
    NotificationsModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
