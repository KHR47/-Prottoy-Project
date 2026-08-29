import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GhushReport } from './ghush-report.entity';

@Entity('ghush_report_evidence')
export class GhushReportEvidence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column()
  url: string;

  @ManyToOne(() => GhushReport, (report) => report.evidence, {
    onDelete: 'CASCADE',
  })
  ghushReport: GhushReport;

  @CreateDateColumn()
  createdAt: Date;
}
