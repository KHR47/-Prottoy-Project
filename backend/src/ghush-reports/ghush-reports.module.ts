import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GhushReport } from './entities/ghush-report.entity';
import { GhushReportEvidence } from './entities/ghush-report-evidence.entity';
import { GhushReportsService } from './ghush-reports.service';
import { GhushReportsController } from './ghush-reports.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GhushReport, GhushReportEvidence]),
    NotificationsModule,
  ],
  controllers: [GhushReportsController],
  providers: [GhushReportsService],
  exports: [GhushReportsService],
})
export class GhushReportsModule {}
