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
import { HousingReview } from './housing-review.entity';

export enum HousingStatus {
  PENDING = 'PENDING',
  INSPECTING = 'INSPECTING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('housing_listings')
@Index(['divisionName', 'rent'])
@Index(['status'])
@Index(['ratingAvg'])
export class HousingListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  address: string;

  @Column({ type: 'varchar', nullable: true })
  divisionName?: string;

  @Column({ type: 'varchar', nullable: true })
  districtName?: string;

  @Column('decimal', { precision: 12, scale: 2 })
  rent: number;

  @Column({ type: 'int', default: 1 })
  rooms: number;

  @Column({ type: 'varchar', default: 'Family / Bachelor' })
  rentType: string;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'varchar', nullable: true })
  contactPhone?: string;

  @Column({
    type: 'enum',
    enum: HousingStatus,
    default: HousingStatus.PENDING,
  })
  status: HousingStatus;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  moderationNotes?: string | null;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @ManyToOne(() => User, { eager: true, nullable: true })
  owner?: User | null;

  @OneToMany(() => HousingReview, (review) => review.housingListing, {
    cascade: true,
  })
  reviews: HousingReview[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
