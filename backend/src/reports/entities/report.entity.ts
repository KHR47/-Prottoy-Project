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
import { Category } from '../../categories/entities/category.entity';
import { Priority } from '../../common/enums/priority.enum';
import { ReportStatus } from '../../common/enums/report-status.enum';
import { User } from '../../users/entities/user.entity';
import { Division } from '../../locations/entities/division.entity';
import { District } from '../../locations/entities/district.entity';
import { Upazila } from '../../locations/entities/upazila.entity';
import { Thana } from '../../locations/entities/thana.entity';
import { Comment } from './comment.entity';
import { StatusHistory } from './status-history.entity';
import { ReportSupport } from './report-support.entity';
import { Document } from '../../documents/entities/document.entity';

export enum ReportType {
  CIVIC = 'civic',
  CRIME = 'crime',
}

@Entity('reports')
@Index(['status', 'createdAt'])
@Index(['divisionName', 'districtName'])
@Index(['type'])
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.SUBMITTED,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column()
  location: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ default: false })
  isAnonymous: boolean;

  @Column({ nullable: true })
  divisionName: string;

  @Column({ nullable: true })
  districtName: string;

  @Column({ nullable: true })
  upazilaName: string;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @ManyToOne(() => User, { eager: true })
  reportedBy: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  assignedOfficer?: User;

  @OneToMany(() => Comment, (comment) => comment.report)
  comments: Comment[];

  @OneToMany(() => StatusHistory, (history) => history.report, {
    cascade: true,
  })
  statusHistory: StatusHistory[];

  @OneToMany(() => ReportSupport, (support) => support.report, {
    cascade: true,
  })
  supports: ReportSupport[];

  @OneToMany(() => Document, (document) => document.report, {
    eager: true,
    cascade: true,
  })
  documents: Document[];

  @Column({ default: 0 })
  upvoteCount: number;

  @Column({ default: false })
  updateRequested: boolean;

  @Column({ default: false })
  updateAllowed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
