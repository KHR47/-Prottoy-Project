import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LostFoundType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export enum LostFoundStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INSPECTING = 'INSPECTING',
  FOUND = 'FOUND',
  RETURNED = 'RETURNED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('lost_found_items')
@Index(['type', 'status'])
@Index(['divisionName', 'category'])
export class LostFoundItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LostFoundType,
    default: LostFoundType.LOST,
  })
  type: LostFoundType;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  contact: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  divisionName?: string;

  @Column({ type: 'varchar', nullable: true })
  districtName?: string;

  @Column({
    type: 'enum',
    enum: LostFoundStatus,
    default: LostFoundStatus.ACTIVE,
  })
  status: LostFoundStatus;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rewardAmount?: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  reportedBy?: User | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  claimedBy?: User | null;

  @Column({ type: 'text', nullable: true })
  claimMessage?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
