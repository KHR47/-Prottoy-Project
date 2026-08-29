import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LostFoundItem,
  LostFoundStatus,
  LostFoundType,
} from './entities/lost-found-item.entity';
import { CreateLostFoundDto } from './dto/create-lost-found.dto';
import { ClaimLostFoundDto, UpdateLostFoundStatusDto } from './dto/claim-lost-found.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import type { SafeUser } from '../common/types/request-with-user.type';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LostFoundService {
  constructor(
    @InjectRepository(LostFoundItem)
    private readonly repo: Repository<LostFoundItem>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateLostFoundDto,
    files: Express.Multer.File[] = [],
    user?: User | SafeUser,
  ): Promise<LostFoundItem> {
    if (user && (user.role === Role.AUTHORITY || user.role === Role.OFFICER)) {
      throw new ForbiddenException('Authority and officer accounts cannot post lost/found items. They manage custody and claim verification.');
    }

    const imageUrls = files.map((f) => `/uploads/${f.filename}`);
    if (dto.images && Array.isArray(dto.images)) {
      imageUrls.push(...dto.images);
    }

    const item = this.repo.create({
      ...dto,
      images: imageUrls,
      status: LostFoundStatus.PENDING,
      reportedBy: user ? ({ id: user.id } as User) : null,
    });

    return this.repo.save(item);
  }

  async findAll(query: {
    type?: LostFoundType;
    category?: string;
    status?: LostFoundStatus;
    divisionName?: string;
    q?: string;
  }): Promise<LostFoundItem[]> {
    const qb = this.repo.createQueryBuilder('item')
      .leftJoinAndSelect('item.reportedBy', 'reportedBy')
      .leftJoinAndSelect('item.claimedBy', 'claimedBy');

    if (query.type) {
      qb.andWhere('item.type = :type', { type: query.type });
    }

    if (query.category && query.category !== 'All' && query.category !== 'All Categories' && query.category !== 'সকল ক্যাটাগরি') {
      qb.andWhere('item.category = :category', { category: query.category });
    }

    if (query.divisionName && query.divisionName !== 'All' && query.divisionName !== 'All Divisions' && query.divisionName !== 'সকল বিভাগ') {
      qb.andWhere('item.divisionName = :div', { div: query.divisionName });
    }

    if (query.status) {
      qb.andWhere('item.status = :status', { status: query.status });
    }

    if (query.q) {
      qb.andWhere(
        '(LOWER(item.title) LIKE LOWER(:q) OR LOWER(item.description) LIKE LOWER(:q) OR LOWER(item.location) LIKE LOWER(:q))',
        { q: `%${query.q}%` },
      );
    }

    qb.orderBy('item.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<LostFoundItem> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['reportedBy', 'claimedBy'],
    });
    if (!item) {
      throw new NotFoundException(`Item #${id} not found`);
    }
    return item;
  }

  async claimItem(
    id: number,
    dto: ClaimLostFoundDto,
    user: User | SafeUser,
  ): Promise<LostFoundItem> {
    if (user.role === Role.AUTHORITY || user.role === Role.ADMIN || user.role === Role.OFFICER) {
      throw new ForbiddenException('Authority and officer accounts cannot submit claims for items.');
    }

    const item = await this.findOne(id);

    if (item.reportedBy && item.reportedBy.id === user.id) {
      throw new BadRequestException('You cannot claim an item that you posted yourself.');
    }

    if (item.status === LostFoundStatus.RETURNED || item.status === LostFoundStatus.REJECTED) {
      throw new BadRequestException(`Cannot claim an item that is ${item.status.toLowerCase()}.`);
    }

    item.claimedBy = { id: user.id } as User;
    item.claimMessage = dto.message;
    item.claimedAt = new Date();
    const savedItem = await this.repo.save(item);

    if (item.reportedBy) {
      await this.notificationsService.createNotification(
        item.reportedBy,
        `A citizen submitted an ownership claim for your post "${item.title}". Claim message: "${dto.message}"`,
        null,
        'lost-found',
      );
    }

    await this.notificationsService.createNotification(
      user,
      `Your ownership claim for "${item.title}" was submitted successfully. Municipal Authority will review and coordinate return custody.`,
      null,
      'lost-found',
    );

    return savedItem;
  }

  async updateStatus(
    id: number,
    dto: UpdateLostFoundStatusDto,
    user: User | SafeUser,
  ): Promise<LostFoundItem> {
    const item = await this.findOne(id);
    item.status = dto.status;
    if (dto.resolutionNotes) {
      item.resolutionNotes = dto.resolutionNotes;
    }

    if (dto.status === LostFoundStatus.ACTIVE) {
      if (item.reportedBy) {
        await this.notificationsService.createNotification(
          item.reportedBy,
          `Your lost/found post "${item.title}" has been verified and activated in the municipal ledger.`,
          null,
          'lost-found',
        );
      }
      return this.repo.save(item);
    } else if (dto.status === LostFoundStatus.INSPECTING) {
      if (item.reportedBy) {
        await this.notificationsService.createNotification(
          item.reportedBy,
          `Your lost/found post "${item.title}" is currently under inspection by municipal custody officers.`,
          null,
          'lost-found',
        );
      }
      return this.repo.save(item);
    } else if (dto.status === LostFoundStatus.RETURNED) {
      if (item.reportedBy) {
        await this.notificationsService.createNotification(
          item.reportedBy,
          `Your lost/found post "${item.title}" has been successfully resolved and marked as RETURNED to the owner.`,
          null,
          'lost-found',
        );
      }
      if (item.claimedBy) {
        await this.notificationsService.createNotification(
          item.claimedBy,
          `The lost/found item "${item.title}" that you claimed has been marked as RETURNED and finalized.`,
          null,
          'lost-found',
        );
      }
      return this.repo.save(item);
    } else if (dto.status === LostFoundStatus.REJECTED) {
      const reasonText = dto.resolutionNotes?.trim() || 'Incomplete details, unverifiable information, or inappropriate category.';
      const msg = `Your lost & found post "${item.title}" (${item.category || 'Belonging'}) was rejected by Authority and removed from the ledger. Reason: ${reasonText}`;
      if (item.reportedBy) {
        await this.notificationsService.createNotification(
          item.reportedBy,
          msg,
          null,
          'lost-found',
        );
      }
      await this.repo.remove(item);
      return { ...item, id, status: LostFoundStatus.REJECTED } as any;
    }

    return this.repo.save(item);
  }
}
