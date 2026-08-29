import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HousingListing } from './housing-listing.entity';

@Entity('housing_reviews')
export class HousingReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column('text')
  body: string;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @ManyToOne(() => User, { eager: true, nullable: true })
  author?: User | null;

  @ManyToOne(() => HousingListing, (listing) => listing.reviews, {
    onDelete: 'CASCADE',
  })
  housingListing: HousingListing;

  @CreateDateColumn()
  createdAt: Date;
}
