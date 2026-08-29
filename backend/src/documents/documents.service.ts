import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Report } from '../reports/entities/report.entity';
import { SafeUser } from '../common/types/request-with-user.type';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
  ) {}

  async uploadDocument(reportId: number, file: Express.Multer.File, user: SafeUser) {
    const report = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: ['reportedBy'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (user.role === 'citizen' && (!report.reportedBy || report.reportedBy.id !== user.id)) {
      throw new ForbiddenException('You can only upload documents to your own reports');
    }

    const document = this.documentsRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      report,
      uploadedBy: user as User,
    });

    return this.documentsRepository.save(document);
  }
}
