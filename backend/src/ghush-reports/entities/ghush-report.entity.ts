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
import { GhushReportEvidence } from './ghush-report-evidence.entity';

export enum GhushReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('ghush_reports')
@Index(['status', 'createdAt'])
@Index(['divisionName'])
export class GhushReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: true })
  isAnonymous: boolean;

  @Column({
    type: 'enum',
    enum: GhushReportStatus,
    default: GhushReportStatus.PENDING,
  })
  status: GhushReportStatus;

  @Column({ type: 'varchar', nullable: true })
  department?: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  amountInvolved?: number;

  @Column({ type: 'timestamp', nullable: true })
  incidentDate?: Date;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'varchar', nullable: true })
  divisionName?: string;

  @Column({ type: 'varchar', nullable: true })
  districtName?: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  reportedBy?: User | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  verifiedBy?: User | null;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;

  @OneToMany(() => GhushReportEvidence, (evidence) => evidence.ghushReport, {
    cascade: true,
    eager: true,
  })
  evidence: GhushReportEvidence[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
