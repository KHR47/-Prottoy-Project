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

@Entity('universal_comments')
@Index(['targetType', 'targetId', 'createdAt'])
export class UniversalComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  targetType: string; // 'report' | 'lost-found' | 'housing' | 'service' | 'ghush'

  @Column({ type: 'int' })
  targetId: number;

  @Column('text')
  body: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  author?: User | null;

  @Column({ type: 'varchar', nullable: true })
  guestAuthorName?: string;

  @ManyToOne(() => UniversalComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent?: UniversalComment | null;

  @OneToMany(() => UniversalComment, (comment) => comment.parent)
  replies: UniversalComment[];

  @Column({ type: 'boolean', default: false })
  isModerated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
