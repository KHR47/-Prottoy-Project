import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceListing, ServiceStatus } from './entities/service-listing.entity';
import { ServiceReview } from './entities/service-review.entity';
import { CreateServiceDto, CreateServiceReviewDto } from './dto/create-service.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import type { SafeUser } from '../common/types/request-with-user.type';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceListing)
    private readonly serviceRepo: Repository<ServiceListing>,
    @InjectRepository(ServiceReview)
    private readonly reviewRepo: Repository<ServiceReview>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateServiceDto,
    files: Express.Multer.File[] = [],
    user?: User | SafeUser,
  ): Promise<ServiceListing> {
    if (user && (user.role === Role.AUTHORITY || user.role === Role.OFFICER)) {
      throw new ForbiddenException('Authority and officer accounts cannot create trade service listings. They perform badge and verification oversight.');
    }

    const imageUrls = files.map((f) => `/uploads/${f.filename}`);
    if (dto.images && Array.isArray(dto.images)) {
      imageUrls.push(...dto.images);
    }

    const listing = this.serviceRepo.create({
      ...dto,
      images: imageUrls,
      isVerified: false,
      status: ServiceStatus.PENDING,
      trustBadge: 'Pending Verification',
      owner: user ? ({ id: user.id } as User) : null,
    });

    return this.serviceRepo.save(listing);
  }

  async findAll(query: {
    category?: string;
    divisionName?: string;
    status?: ServiceStatus;
    q?: string;
  }): Promise<ServiceListing[]> {
    const qb = this.serviceRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.owner', 'owner')
      .leftJoinAndSelect('s.reviews', 'reviews')
      .leftJoinAndSelect('reviews.author', 'reviewAuthor');

    if (query.category && query.category !== 'All' && query.category !== 'All Categories') {
      qb.andWhere('s.category ILIKE :cat', { cat: `%${query.category}%` });
    }

    if (query.divisionName && query.divisionName !== 'All' && query.divisionName !== 'All Divisions') {
      qb.andWhere('s.divisionName = :div', { div: query.divisionName });
    }

    if (query.status) {
      qb.andWhere('s.status = :st', { st: query.status });
    }

    if (query.q) {
      qb.andWhere('(s.name ILIKE :q OR s.details ILIKE :q OR s.location ILIKE :q)', {
        q: `%${query.q}%`,
      });
    }

    qb.orderBy('s.createdAt', 'DESC');
    return qb.getMany();
  }

  async moderate(id: number, status: ServiceStatus, notes?: string): Promise<ServiceListing> {
    const listing = await this.findOne(id);
    listing.status = status;
    listing.moderationNotes = notes || null;

    if (status === ServiceStatus.APPROVED) {
      listing.isVerified = true;
      listing.trustBadge = 'Authority Verified Pro';
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          `Your service listing "${listing.name}" (${listing.category}) has been verified and approved by Municipal Authority!`,
          null,
          'service',
        );
      }
      return this.serviceRepo.save(listing);
    } else if (status === ServiceStatus.INSPECTING) {
      listing.isVerified = false;
      listing.trustBadge = 'Under Inspection';
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          `Your service listing "${listing.name}" is currently under inspection by municipal audit team.`,
          null,
          'service',
        );
      }
      return this.serviceRepo.save(listing);
    } else if (status === ServiceStatus.REJECTED) {
      const reasonText = notes?.trim() || 'Listing details do not meet municipal certification guidelines or incorrect category.';
      const msg = `Your service listing "${listing.name}" (${listing.category}) was rejected by Authority and removed from the directory. Reason: ${reasonText}`;
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          msg,
          null,
          'service',
        );
      }
      await this.serviceRepo.remove(listing);
      return { ...listing, id, status: ServiceStatus.REJECTED, isVerified: false } as any;
    }

    return this.serviceRepo.save(listing);
  }

  async findOne(id: number): Promise<ServiceListing> {
    const service = await this.serviceRepo.findOne({
      where: { id },
      relations: ['owner', 'reviews', 'reviews.author'],
    });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    return service;
  }

  async addReview(
    serviceId: number,
    dto: CreateServiceReviewDto,
    user?: User | SafeUser,
  ): Promise<ServiceReview> {
    const service = await this.findOne(serviceId);

    const review = this.reviewRepo.create({
      rating: dto.rating,
      body: dto.body,
      author: user ? ({ id: user.id } as User) : null,
      serviceListing: service,
    });

    const saved = await this.reviewRepo.save(review);

    // Recalculate average rating
    const allReviews = await this.reviewRepo.find({
      where: { serviceListing: { id: serviceId } },
    });
    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? Number((sum / total).toFixed(2)) : 0;

    service.ratingAvg = avg;
    service.totalReviews = total;
    await this.serviceRepo.save(service);

    return saved;
  }
}
