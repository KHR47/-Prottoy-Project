import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HousingListing, HousingStatus } from './entities/housing-listing.entity';
import { HousingReview } from './entities/housing-review.entity';
import { CreateHousingDto, CreateHousingReviewDto } from './dto/create-housing.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import type { SafeUser } from '../common/types/request-with-user.type';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class HousingService {
  constructor(
    @InjectRepository(HousingListing)
    private readonly listingRepo: Repository<HousingListing>,
    @InjectRepository(HousingReview)
    private readonly reviewRepo: Repository<HousingReview>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateHousingDto,
    files: Express.Multer.File[] = [],
    user?: User | SafeUser,
  ): Promise<HousingListing> {
    if (user && (user.role === Role.AUTHORITY || user.role === Role.OFFICER)) {
      throw new ForbiddenException('Authority and officer accounts cannot list rental properties. They oversee tenant standards and landlord moderation.');
    }

    const imageUrls = files.map((f) => `/uploads/${f.filename}`);
    if (dto.images && Array.isArray(dto.images)) {
      imageUrls.push(...dto.images);
    }

    const listing = this.listingRepo.create({
      ...dto,
      images: imageUrls,
      isVerified: false,
      status: HousingStatus.PENDING,
      owner: user ? ({ id: user.id } as User) : null,
    });

    return this.listingRepo.save(listing);
  }

  async findAll(query: {
    minRent?: number;
    maxRent?: number;
    rooms?: number;
    divisionName?: string;
    status?: HousingStatus;
    q?: string;
  }): Promise<HousingListing[]> {
    const qb = this.listingRepo.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.owner', 'owner')
      .leftJoinAndSelect('listing.reviews', 'reviews')
      .leftJoinAndSelect('reviews.author', 'reviewAuthor');

    if (query.minRent) {
      qb.andWhere('listing.rent >= :minRent', { minRent: query.minRent });
    }

    if (query.maxRent) {
      qb.andWhere('listing.rent <= :maxRent', { maxRent: query.maxRent });
    }

    if (query.rooms) {
      qb.andWhere('listing.rooms = :rooms', { rooms: query.rooms });
    }

    if (query.divisionName && query.divisionName !== 'All' && query.divisionName !== 'All Divisions' && query.divisionName !== 'সকল বিভাগ') {
      qb.andWhere('listing.divisionName = :div', { div: query.divisionName });
    }

    if (query.status) {
      qb.andWhere('listing.status = :status', { status: query.status });
    }

    if (query.q) {
      qb.andWhere(
        '(LOWER(listing.title) LIKE LOWER(:q) OR LOWER(listing.address) LIKE LOWER(:q) OR LOWER(listing.description) LIKE LOWER(:q))',
        { q: `%${query.q}%` },
      );
    }

    qb.orderBy('listing.createdAt', 'DESC');
    return qb.getMany();
  }

  async moderate(
    id: number,
    status: HousingStatus,
    notes?: string,
  ): Promise<HousingListing> {
    const listing = await this.findOne(id);

    listing.status = status;
    listing.moderationNotes = notes || null;

    if (status === HousingStatus.APPROVED) {
      listing.isVerified = true;
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          `Your rental listing "${listing.title}" (${listing.address}) has been verified and approved by Municipal Authority!`,
          null,
          'housing',
        );
      }
      return this.listingRepo.save(listing);
    } else if (status === HousingStatus.INSPECTING) {
      listing.isVerified = false;
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          `Your rental listing "${listing.title}" is currently under inspection by municipal audit team.`,
          null,
          'housing',
        );
      }
      return this.listingRepo.save(listing);
    } else if (status === HousingStatus.REJECTED) {
      const reasonText = notes?.trim() || 'Listing details do not satisfy municipal tenancy verification criteria or invalid property data.';
      const msg = `Your rental listing "${listing.title}" (${listing.address}) was rejected by Authority and removed from the directory. Reason: ${reasonText}`;
      if (listing.owner) {
        await this.notificationsService.createNotification(
          listing.owner,
          msg,
          null,
          'housing',
        );
      }
      await this.listingRepo.remove(listing);
      return { ...listing, id, status: HousingStatus.REJECTED, isVerified: false } as any;
    }

    return this.listingRepo.save(listing);
  }

  async findOne(id: number): Promise<HousingListing> {
    const listing = await this.listingRepo.findOne({
      where: { id },
      relations: ['owner', 'reviews', 'reviews.author'],
    });

    if (!listing) {
      throw new NotFoundException(`Housing listing #${id} not found`);
    }

    return listing;
  }

  async addReview(
    listingId: number,
    dto: CreateHousingReviewDto,
    files: Express.Multer.File[] = [],
    user?: User | SafeUser,
  ): Promise<HousingReview> {
    const listing = await this.findOne(listingId);

    const imageUrls = files.map((f) => `/uploads/${f.filename}`);
    if (dto.images && Array.isArray(dto.images)) {
      imageUrls.push(...dto.images);
    }

    const review = this.reviewRepo.create({
      rating: dto.rating,
      body: dto.body,
      images: imageUrls,
      author: user ? ({ id: user.id } as User) : null,
      housingListing: listing,
    });

    const saved = await this.reviewRepo.save(review);

    // Recalculate average rating
    const allReviews = await this.reviewRepo.find({
      where: { housingListing: { id: listingId } },
    });
    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? Number((sum / total).toFixed(2)) : 0;

    listing.ratingAvg = avg;
    listing.totalReviews = total;
    await this.listingRepo.save(listing);

    return saved;
  }
}
