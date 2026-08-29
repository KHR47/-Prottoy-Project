import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('universal_votes')
@Unique(['targetType', 'targetId', 'user'])
export class UniversalVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  targetType: string; // 'report' | 'lost-found' | 'housing' | 'service' | 'ghush'

  @Column({ type: 'int' })
  targetId: number;

  @Column({ type: 'int' })
  value: number; // +1 for upvote, -1 for downvote

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
