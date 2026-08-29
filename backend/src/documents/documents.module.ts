import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { UploadsController } from './uploads.controller';
import { Document } from './entities/document.entity';
import { Report } from '../reports/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Report])],
  controllers: [DocumentsController, UploadsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
