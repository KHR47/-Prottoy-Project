import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UniversalComment } from './entities/universal-comment.entity';
import { CreateUniversalCommentDto } from './dto/create-comment.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import type { SafeUser } from '../common/types/request-with-user.type';

@Injectable()
export class UniversalCommentsService {
  constructor(
    @InjectRepository(UniversalComment)
    private readonly commentRepo: Repository<UniversalComment>,
  ) {}

  async create(
    dto: CreateUniversalCommentDto,
    user?: User | SafeUser,
  ): Promise<UniversalComment> {
    const authorName = user?.name || dto.guestAuthorName || 'Citizen';
    const comment = this.commentRepo.create({
      targetType: dto.targetType,
      targetId: dto.targetId,
      body: dto.body,
      guestAuthorName: authorName,
      author: user ? ({ id: user.id } as User) : null,
      parent: dto.parentId ? ({ id: dto.parentId } as UniversalComment) : null,
    });

    const saved = await this.commentRepo.save(comment);
    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['author', 'parent'],
    }) as Promise<UniversalComment>;
  }

  async findByTarget(targetType: string, targetId: number): Promise<UniversalComment[]> {
    return this.commentRepo.find({
      where: {
        targetType,
        targetId,
        parent: IsNull(),
      },
      relations: ['author', 'replies', 'replies.author'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async remove(id: number, user: SafeUser | User): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    if (user.role !== Role.ADMIN && (!comment.author || comment.author.id !== user.id)) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepo.remove(comment);
  }
}
