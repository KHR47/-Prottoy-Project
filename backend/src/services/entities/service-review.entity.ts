import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceListing } from './service-listing.entity';

@Entity('service_reviews')
export class ServiceReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column('text')
  body: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  author?: User | null;

  @ManyToOne(() => ServiceListing, (listing) => listing.reviews, {
    onDelete: 'CASCADE',
  })
  serviceListing: ServiceListing;

  @CreateDateColumn()
  createdAt: Date;
}
