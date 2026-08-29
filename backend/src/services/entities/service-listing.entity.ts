import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceReview } from './service-review.entity';

export enum ServiceStatus {
  PENDING = 'PENDING',
  INSPECTING = 'INSPECTING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('service_listings')
@Index(['category', 'divisionName'])
@Index(['status'])
@Index(['ratingAvg'])
export class ServiceListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string; // Electrician, Plumber, Appliance Repair, Cleaning, IT & Hardware, Healthcare/Ambulance, etc.

  @Column('text')
  details: string;

  @Column({ type: 'varchar', nullable: true })
  contact: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  divisionName?: string;

  @Column({ type: 'varchar', nullable: true })
  districtName?: string;

  @Column({
    type: 'enum',
    enum: ServiceStatus,
    default: ServiceStatus.PENDING,
  })
  status: ServiceStatus;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', default: 'Community Listed' })
  trustBadge: string;

  @Column({ type: 'text', nullable: true })
  moderationNotes?: string | null;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @ManyToOne(() => User, { eager: true, nullable: true })
  owner?: User | null;

  @OneToMany(() => ServiceReview, (review) => review.serviceListing, {
    cascade: true,
  })
  reviews: ServiceReview[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
