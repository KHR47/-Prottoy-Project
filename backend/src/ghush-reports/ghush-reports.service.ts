import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GhushReport,
  GhushReportStatus,
} from './entities/ghush-report.entity';
import { GhushReportEvidence } from './entities/ghush-report-evidence.entity';
import { CreateGhushReportDto } from './dto/create-ghush-report.dto';
import { VerifyGhushReportDto } from './dto/verify-ghush-report.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import type { SafeUser } from '../common/types/request-with-user.type';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GhushReportsService {
  constructor(
    @InjectRepository(GhushReport)
    private readonly reportRepository: Repository<GhushReport>,
    @InjectRepository(GhushReportEvidence)
    private readonly evidenceRepository: Repository<GhushReportEvidence>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createDto: CreateGhushReportDto,
    files: Express.Multer.File[] = [],
    user?: User | SafeUser,
  ): Promise<GhushReport> {
    if (user && (user.role === Role.AUTHORITY || user.role === Role.OFFICER)) {
      throw new ForbiddenException('Authority and officer accounts cannot submit whistleblower dossiers. They manage review and verification.');
    }

    const evidenceUrls = files.map((f) => `/uploads/${f.filename}`);

    const report = this.reportRepository.create({
      ...createDto,
      reportedBy: user ? ({ id: user.id } as User) : null,
      status: GhushReportStatus.PENDING,
    });

    const saved = await this.reportRepository.save(report);

    if (files && files.length > 0) {
      const evidenceList: GhushReportEvidence[] = [];
      for (const file of files) {
        const evidence = this.evidenceRepository.create({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          ghushReport: saved,
        });
        evidenceList.push(evidence);
      }
      await this.evidenceRepository.save(evidenceList);
    }

    return this.findOne(saved.id, user);
  }

  async findAll(
    query: {
      status?: GhushReportStatus;
      department?: string;
      divisionName?: string;
      myReports?: boolean;
    },
    user?: User | SafeUser,
  ): Promise<GhushReport[]> {
    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.evidence', 'evidence')
      .leftJoinAndSelect('report.reportedBy', 'reportedBy')
      .leftJoinAndSelect('report.verifiedBy', 'verifiedBy')
      .orderBy('report.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    if (query.department) {
      qb.andWhere('report.department = :dept', { dept: query.department });
    }

    if (query.divisionName) {
      qb.andWhere('report.divisionName = :div', { div: query.divisionName });
    }

    if (query.myReports && user) {
      qb.andWhere('reportedBy.id = :userId', { userId: user.id });
    }

    const reports = await qb.getMany();
    return reports.map((r) => this.maskReport(r, user));
  }

  async findOne(id: number, user?: User | SafeUser): Promise<GhushReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['evidence', 'reportedBy', 'verifiedBy'],
    });

    if (!report) {
      throw new NotFoundException(`Ghush report #${id} not found`);
    }

    return this.maskReport(report, user);
  }

  async verify(
    id: number,
    verifyDto: VerifyGhushReportDto,
    adminUser: User | SafeUser,
  ): Promise<GhushReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['evidence', 'reportedBy', 'verifiedBy'],
    });

    if (!report) {
      throw new NotFoundException(`Ghush report #${id} not found`);
    }

    report.status = verifyDto.status;
    report.reviewNotes = verifyDto.reviewNotes || report.reviewNotes;
    report.verifiedBy = { id: adminUser.id } as User;
    report.verifiedAt = new Date();

    if (verifyDto.status === GhushReportStatus.VERIFIED) {
      if (report.reportedBy) {
        await this.notificationsService.createNotification(
          report.reportedBy,
          `Your whistleblower corruption report #${report.id} ("${report.title}") has been verified and confirmed by anti-corruption authorities.`,
          null,
          'ghush',
        );
      }
    } else if (verifyDto.status === GhushReportStatus.UNDER_REVIEW) {
      if (report.reportedBy) {
        await this.notificationsService.createNotification(
          report.reportedBy,
          `Your whistleblower corruption report #${report.id} ("${report.title}") is currently under active audit and investigation.`,
          null,
          'ghush',
        );
      }
    } else if (verifyDto.status === GhushReportStatus.REJECTED) {
      const reasonText = verifyDto.reviewNotes?.trim() || 'Claim dismissed due to insufficient corroborating evidence or unverifiable allegations.';
      const msg = `Your whistleblower report #${report.id} ("${report.title}") was rejected/dismissed by anti-corruption authorities and removed from active vault. Reason: ${reasonText}`;
      if (report.reportedBy) {
        await this.notificationsService.createNotification(
          report.reportedBy,
          msg,
          null,
          'ghush',
        );
      }
      await this.reportRepository.remove(report);
      return { ...report, id, status: GhushReportStatus.REJECTED } as any;
    }

    const updated = await this.reportRepository.save(report);
    return this.maskReport(updated, adminUser);
  }

  async getStats() {
    const total = await this.reportRepository.count();
    const verified = await this.reportRepository.count({
      where: { status: GhushReportStatus.VERIFIED },
    });
    const underReview = await this.reportRepository.count({
      where: { status: GhushReportStatus.UNDER_REVIEW },
    });
    const pending = await this.reportRepository.count({
      where: { status: GhushReportStatus.PENDING },
    });

    const sumResult = await this.reportRepository
      .createQueryBuilder('report')
      .select('SUM(report.amountInvolved)', 'totalBribeAmount')
      .getRawOne();

    return {
      total,
      verified,
      underReview,
      pending,
      totalBribeAmount: Number(sumResult?.totalBribeAmount || 0),
    };
  }

  private maskReport(report: GhushReport, currentUser?: User | SafeUser): GhushReport {
    // If report is anonymous, and current user is not admin/authority or the author, mask reporter info
    const isPrivileged =
      currentUser &&
      (currentUser.role === Role.ADMIN ||
        currentUser.role === Role.AUTHORITY ||
        currentUser.role === Role.OFFICER);
    const isAuthor =
      currentUser &&
      report.reportedBy &&
      currentUser.id === report.reportedBy.id;

    if (report.isAnonymous && !isPrivileged && !isAuthor) {
      report.reportedBy = null;
    }
    return report;
  }
}
