import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Role } from '../common/enums/role.enum';
import { ReportStatus } from '../common/enums/report-status.enum';
import type { SafeUser } from '../common/types/request-with-user.type';
import { User } from '../users/entities/user.entity';
import { Division } from '../locations/entities/division.entity';
import { District } from '../locations/entities/district.entity';
import { Upazila } from '../locations/entities/upazila.entity';
import { Thana } from '../locations/entities/thana.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { Priority } from '../common/enums/priority.enum';
import { Report, ReportType } from './entities/report.entity';
import { Comment } from './entities/comment.entity';
import { StatusHistory } from './entities/status-history.entity';
import { ReportSupport } from './entities/report-support.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,

    @InjectRepository(Division)
    private readonly divisionsRepository: Repository<Division>,

    @InjectRepository(District)
    private readonly districtsRepository: Repository<District>,

    @InjectRepository(Upazila)
    private readonly upazilasRepository: Repository<Upazila>,

    @InjectRepository(Thana)
    private readonly thanasRepository: Repository<Thana>,

    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(StatusHistory)
    private readonly statusHistoryRepository: Repository<StatusHistory>,

    @InjectRepository(ReportSupport)
    private readonly reportSupportRepository: Repository<ReportSupport>,

    private readonly notificationsService: NotificationsService,
  ) {}

  private sanitizeReport(report: Report, currentUser?: SafeUser): Report {
    if (report && report.isAnonymous) {
      if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.id !== report.reportedBy?.id)) {
        // Strip reportedBy if the user is not an admin and not the creator
        report.reportedBy = null as any;
      }
    }
    return report;
  }

  async create(createReportDto: CreateReportDto, user: SafeUser) {
    if (user.role !== Role.CITIZEN) {
      throw new ForbiddenException('Only citizens can submit reports. Authority accounts perform triage and approval.');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: createReportDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const report = this.reportsRepository.create({
      title: createReportDto.title,
      description: createReportDto.description,
      type: createReportDto.type,
      location: createReportDto.location,
      latitude: createReportDto.latitude,
      longitude: createReportDto.longitude,
      divisionName: createReportDto.divisionName,
      districtName: createReportDto.districtName,
      upazilaName: createReportDto.upazilaName,
      category,
      isAnonymous: createReportDto.isAnonymous || false,
      reportedBy: user as User,
    });

    const savedReport = await this.reportsRepository.save(report);

    // Log the initial status
    const statusHistory = this.statusHistoryRepository.create({
      status: ReportStatus.SUBMITTED,
      report: savedReport,
      changedBy: user as User,
      notes: 'Report initially submitted',
    });
    await this.statusHistoryRepository.save(statusHistory);

    // Notify all authority users about the new report
    const authorities = await this.usersRepository.find({
      where: { role: Role.AUTHORITY },
    });

    for (const authority of authorities) {
      await this.notificationsService.createNotification(
        authority,
        `A new ${savedReport.type} report (#${savedReport.id}) has been submitted.`,
        savedReport.id,
      );
    }

    return this.sanitizeReport(savedReport, user);
  }

  async findAll(user: SafeUser) {
    const reports = await this.reportsRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return reports.map((r) => this.sanitizeReport(r, user));
  }

  async findMyReports(user: SafeUser) {
    const reports = await this.reportsRepository.find({
      where: {
        reportedBy: {
          id: user.id,
        },
      },
      order: {
        id: 'DESC',
      },
    });
    return reports.map((r) => this.sanitizeReport(r, user));
  }

  async findPublicReports(user?: SafeUser) {
    const reports = await this.reportsRepository.find({
      where: {
        type: ReportType.CIVIC,
      },
      order: {
        upvoteCount: 'DESC',
        id: 'DESC',
      },
    });
    return reports.map((r) => this.sanitizeReport(r, user));
  }

  async findAssignedReports(user: SafeUser) {
    const reports = await this.reportsRepository.find({
      where: {
        assignedOfficer: {
          id: user.id,
        },
      },
      order: {
        id: 'DESC',
      },
    });
    return reports.map((r) => this.sanitizeReport(r, user));
  }

  async findOne(id: number, user?: SafeUser) {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['comments', 'statusHistory'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (user) {
      if (user.role === Role.CITIZEN && report.reportedBy?.id !== user.id) {
        throw new ForbiddenException('You can only view your own reports');
      }
      if (
        user.role === Role.OFFICER &&
        report.assignedOfficer?.id !== user.id
      ) {
        throw new ForbiddenException(
          'You can only view reports assigned to you',
        );
      }
    }

    return this.sanitizeReport(report, user);
  }

  async assignReport(reportId: number, officerId: number, user: SafeUser) {
    if (user.role !== Role.AUTHORITY && user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only authority or admin can assign reports',
      );
    }

    const report = await this.findOne(reportId);

    const officer = await this.usersRepository.findOne({
      where: {
        id: officerId,
      },
    });

    if (!officer) {
      throw new NotFoundException('Officer not found');
    }

    if (officer.role !== Role.OFFICER) {
      throw new BadRequestException('Selected user is not an officer');
    }

    report.assignedOfficer = officer;
    report.status = ReportStatus.ASSIGNED;

    const savedReport = await this.reportsRepository.save(report);

    await this.notificationsService.createNotification(
      officer,
      `You have been assigned to investigate report #${savedReport.id} ("${savedReport.title}")`,
      savedReport.id,
      'report',
    );

    if (savedReport.reportedBy) {
      await this.notificationsService.createNotification(
        savedReport.reportedBy,
        `Your civic report #${savedReport.id} ("${savedReport.title}") has been assigned to Field Officer ${officer.name}.`,
        savedReport.id,
        'report',
      );
    }

    return savedReport;
  }

  async updateStatus(
    reportId: number,
    updateStatusDto: UpdateStatusDto,
    user: SafeUser,
  ) {
    const report = await this.findOne(reportId);

    const isAssignedOfficer =
      report.assignedOfficer && report.assignedOfficer.id === user.id;

    if (
      user.role !== Role.AUTHORITY &&
      user.role !== Role.ADMIN &&
      !isAssignedOfficer
    ) {
      throw new ForbiddenException('You are not allowed to update this report');
    }

    if (updateStatusDto.status === ReportStatus.REJECTED) {
      const reason =
        updateStatusDto.notes ||
        updateStatusDto.rejectionReason ||
        'Does not match municipal jurisdiction, lack of evidence, or duplicate submission.';
      const msg = `Your civic report #${report.id} ("${report.title}") was rejected by authority and removed. Reason: ${reason}`;

      const rawReport = await this.reportsRepository.findOne({
        where: { id: reportId },
        relations: ['reportedBy'],
      });

      if (rawReport?.reportedBy) {
        await this.notificationsService.createNotification(
          rawReport.reportedBy,
          msg,
          null,
          'report',
        );
      }

      await this.reportsRepository.remove(report);
      return { ...report, id: reportId, status: ReportStatus.REJECTED } as any;
    }

    report.status = updateStatusDto.status;

    const savedReport = await this.reportsRepository.save(report);

    // Log status change
    const statusHistory = this.statusHistoryRepository.create({
      status: updateStatusDto.status,
      report: savedReport,
      changedBy: user as User,
      notes:
        updateStatusDto.notes || `Status updated to ${updateStatusDto.status}`,
    });
    await this.statusHistoryRepository.save(statusHistory);

    const rawReport = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: ['reportedBy']
    });

    // Notify citizen if status is updated by someone else
    if (rawReport?.reportedBy && rawReport.reportedBy.id !== user.id) {
      await this.notificationsService.createNotification(
        rawReport.reportedBy,
        `Your report #${savedReport.id} status was updated to ${updateStatusDto.status.replace('_', ' ')}`,
        savedReport.id,
      );
    }

    return savedReport;
  }

  async addComment(
    reportId: number,
    addCommentDto: AddCommentDto,
    user: SafeUser,
  ) {
    // Find one will handle checking if the user is authorized to view (and thus comment on) the report
    const report = await this.findOne(reportId, user);

    // Fetch the raw report to get the actual reportedBy for notifications, since findOne might sanitize it.
    const rawReport = await this.reportsRepository.findOne({
      where: { id: reportId },
      relations: ['reportedBy', 'assignedOfficer']
    });

    if (!rawReport) {
      throw new NotFoundException('Report not found');
    }

    const comment = this.commentsRepository.create({
      content: addCommentDto.content,
      report, // Using the sanitized report is fine for saving the relation
      author: user as User,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Notify the citizen if the comment is from someone else (e.g. an officer/admin)
    if (rawReport.reportedBy && user.id !== rawReport.reportedBy.id) {
      await this.notificationsService.createNotification(
        rawReport.reportedBy,
        `Someone commented on your report #${report.id}`,
        report.id,
      );
    } else if (rawReport.assignedOfficer && rawReport.reportedBy && user.id === rawReport.reportedBy.id) {
      // Notify the officer if the citizen commented
      await this.notificationsService.createNotification(
        rawReport.assignedOfficer,
        `Citizen commented on report #${report.id} assigned to you`,
        report.id,
      );
    }

    return savedComment;
  }

  async update(id: number, updateReportDto: UpdateReportDto, user: SafeUser) {
    const report = await this.findOne(id, user);

    if (user.role === Role.CITIZEN) {
      if (report.status !== ReportStatus.SUBMITTED && !report.updateAllowed) {
        throw new ForbiddenException(
          'Cannot edit a report that is already being processed unless authority allows it',
        );
      }
      if (!report.reportedBy || report.reportedBy.id !== user.id) {
        throw new ForbiddenException('You can only edit your own reports');
      }
    } else if (user.role !== Role.ADMIN && user.role !== Role.AUTHORITY) {
      throw new ForbiddenException(
        'You do not have permission to edit this report',
      );
    }

    if (updateReportDto.divisionName !== undefined) {
      report.divisionName = updateReportDto.divisionName;
    }
    if (updateReportDto.districtName !== undefined) {
      report.districtName = updateReportDto.districtName;
    }
    if (updateReportDto.upazilaName !== undefined) {
      report.upazilaName = updateReportDto.upazilaName;
    }
    if (updateReportDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateReportDto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      report.category = category;
    }

    if (updateReportDto.title !== undefined)
      report.title = updateReportDto.title;
    if (updateReportDto.description !== undefined)
      report.description = updateReportDto.description;
    if (updateReportDto.type !== undefined) report.type = updateReportDto.type;
    if (updateReportDto.location !== undefined)
      report.location = updateReportDto.location;
    if (updateReportDto.latitude !== undefined)
      report.latitude = updateReportDto.latitude;
    if (updateReportDto.longitude !== undefined)
      report.longitude = updateReportDto.longitude;

    if (user.role === Role.CITIZEN) {
      report.updateAllowed = false;
      report.updateRequested = false;
    }

    return this.reportsRepository.save(report);
  }

  async remove(id: number, user: SafeUser) {
    const report = await this.findOne(id, user);

    if (user.role === Role.CITIZEN) {
      if (report.status !== ReportStatus.SUBMITTED) {
        throw new ForbiddenException(
          'Cannot delete a report that is already being processed',
        );
      }
      if (!report.reportedBy || report.reportedBy.id !== user.id) {
        throw new ForbiddenException('You can only delete your own reports');
      }
    } else if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins or the creator can delete reports',
      );
    }

    await this.reportsRepository.remove(report);

    return { message: 'Report deleted successfully' };
  }

  async toggleUpvote(reportId: number, user: SafeUser) {
    const report = await this.findOne(reportId);

    if (report.type !== ReportType.CIVIC) {
      throw new BadRequestException('Only civic reports can be upvoted');
    }

    const existingSupport = await this.reportSupportRepository.findOne({
      where: {
        report: { id: reportId },
        user: { id: user.id },
      },
    });

    if (existingSupport) {
      // Remove upvote
      await this.reportSupportRepository.remove(existingSupport);
      report.upvoteCount -= 1;
    } else {
      // Add upvote
      const support = this.reportSupportRepository.create({
        report,
        user: user as User,
      });
      await this.reportSupportRepository.save(support);
      report.upvoteCount += 1;

      // Auto-escalation threshold
      const ESCALATION_THRESHOLD = 5; // Usually 50, set to 5 for demo purposes
      if (
        report.upvoteCount >= ESCALATION_THRESHOLD &&
        report.priority !== Priority.HIGH
      ) {
        report.priority = Priority.HIGH;

        // Notify authorities
        const authorities = await this.usersRepository.find({
          where: { role: Role.AUTHORITY },
        });

        for (const authority of authorities) {
          await this.notificationsService.createNotification(
            authority,
            `Civic report #${report.id} reached ${ESCALATION_THRESHOLD} upvotes and has been automatically escalated to HIGH priority.`,
            report.id,
          );
        }
      }
    }

    await this.reportsRepository.save(report);

    return {
      upvoted: !existingSupport,
      upvoteCount: report.upvoteCount,
      priority: report.priority,
    };
  }

  async requestUpdate(id: number, user: SafeUser) {
    const report = await this.findOne(id, user);

    if (user.role !== Role.CITIZEN || !report.reportedBy || report.reportedBy.id !== user.id) {
      throw new ForbiddenException('Only the creator can request an update');
    }

    if (report.status === ReportStatus.SUBMITTED) {
      throw new BadRequestException('Report is still submitted. You can edit it directly.');
    }

    report.updateRequested = true;
    await this.reportsRepository.save(report);

    // Notify authority
    const authorities = await this.usersRepository.find({
      where: { role: Role.AUTHORITY },
    });

    for (const authority of authorities) {
      await this.notificationsService.createNotification(
        authority,
        `Citizen requested an update for report #${report.id}.`,
        report.id,
      );
    }

    return report;
  }

  async allowUpdate(id: number, user: SafeUser) {
    const report = await this.findOne(id, user);

    if (user.role !== Role.AUTHORITY && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only authority or admin can allow updates');
    }

    report.updateAllowed = true;
    report.updateRequested = false;
    await this.reportsRepository.save(report);

    // Notify citizen
    if (report.reportedBy) {
      await this.notificationsService.createNotification(
        report.reportedBy,
        `Your request to update report #${report.id} has been approved. You can now edit it.`,
        report.id,
      );
    }

    return report;
  }

  async handleIotWebhook(payload: any) {
    const { binId, fillLevel, latitude, longitude, districtName } = payload;
    
    if (fillLevel < 90) {
      return { message: 'Fill level OK. No report generated.' };
    }

    // Find category
    let category = await this.categoriesRepository.findOne({ where: { name: 'Waste Management' } });
    if (!category) {
      category = await this.categoriesRepository.findOne({ where: {} });
    }

    let systemUser = await this.usersRepository.findOne({ where: { email: 'system@civicwatch.com' } });
    if (!systemUser) {
      systemUser = await this.usersRepository.findOne({ where: { role: Role.ADMIN } });
    }

    const report = this.reportsRepository.create({
      title: `Automated Alert: Smart Bin ${binId} Overflow`,
      description: `IoT Sensor detected that Bin ${binId} is at ${fillLevel}% capacity. Immediate collection required.`,
      type: ReportType.CIVIC,
      location: `Smart Bin ${binId}`,
      districtName: String(districtName),
      latitude: Number(latitude),
      longitude: Number(longitude),
      category: category as Category,
      reportedBy: systemUser as User,
      priority: Priority.HIGH,
      status: ReportStatus.SUBMITTED,
    });

    const savedReport = await this.reportsRepository.save(report);

    // Auto-assignment
    if (districtName) {
      const officer = await this.usersRepository.findOne({
        where: { role: Role.OFFICER }
      });
      
      if (officer) {
        savedReport.assignedOfficer = officer;
        savedReport.status = ReportStatus.ASSIGNED;
        await this.reportsRepository.save(savedReport);

        await this.notificationsService.createNotification(
          officer,
          `Automated Dispatch: You have been assigned to clear Smart Bin ${binId}.`,
          savedReport.id,
        );
      }
    }

    // Notify authorities
    const authorities = await this.usersRepository.find({
      where: { role: Role.AUTHORITY },
    });
    for (const authority of authorities) {
      await this.notificationsService.createNotification(
        authority,
        `Automated Alert: Smart Bin ${binId} overflowed and generated a report.`,
        savedReport.id,
      );
    }

    return { message: 'Automated report generated and dispatched.', reportId: savedReport.id };
  }
}
