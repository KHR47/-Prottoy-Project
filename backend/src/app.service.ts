import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Role } from './common/enums/role.enum';
import { Report } from './reports/entities/report.entity';
import { ReportStatus } from './common/enums/report-status.enum';
import { GhushReport } from './ghush-reports/entities/ghush-report.entity';
import { ServiceListing } from './services/entities/service-listing.entity';
import { LostFoundItem, LostFoundStatus } from './lost-found/entities/lost-found-item.entity';
import { ParkingSlot, SlotStatus } from './parking/entities/parking-slot.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(GhushReport)
    private readonly ghushReportRepository: Repository<GhushReport>,
    @InjectRepository(ServiceListing)
    private readonly serviceRepository: Repository<ServiceListing>,
    @InjectRepository(LostFoundItem)
    private readonly lostFoundRepository: Repository<LostFoundItem>,
    @InjectRepository(ParkingSlot)
    private readonly parkingSlotRepository: Repository<ParkingSlot>,
  ) {}

  getHello(): string {
    return 'Smart City Prottoy API Online';
  }

  async getPublicStats() {
    const [
      activeCitizens,
      totalReports,
      resolvedReports,
      ghushReportsCount,
      vettedTrades,
      reunitedItems,
      availableBays,
      totalBays,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: Role.CITIZEN, isActive: true } }),
      this.reportRepository.count(),
      this.reportRepository.count({ where: { status: ReportStatus.RESOLVED } }),
      this.ghushReportRepository.count(),
      this.serviceRepository.count(),
      this.lostFoundRepository.count({
        where: [{ status: LostFoundStatus.RETURNED }, { status: LostFoundStatus.FOUND }],
      }),
      this.parkingSlotRepository.count({ where: { status: SlotStatus.AVAILABLE } }),
      this.parkingSlotRepository.count(),
    ]);

    const resolutionRate =
      totalReports > 0
        ? `${Math.round((resolvedReports / totalReports) * 100)}%`
        : '100%';

    return {
      activeCitizens: activeCitizens > 0 ? `${activeCitizens}` : '0',
      rawCitizensCount: activeCitizens,
      whistleblowerProtected: '100%',
      whistleblowerCount: ghushReportsCount,
      reportsResolved: resolutionRate,
      resolvedReportsCount: resolvedReports,
      totalReportsCount: totalReports,
      verifiedPros: vettedTrades > 0 ? `${vettedTrades}` : '0',
      rawProsCount: vettedTrades,
      reunitedItemsCount: reunitedItems,
      availableBaysCount: availableBays,
      totalBaysCount: totalBays,
    };
  }
}

