import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniversalVote } from './entities/universal-vote.entity';
import { CastVoteDto } from './dto/cast-vote.dto';
import { User } from '../users/entities/user.entity';
import type { SafeUser } from '../common/types/request-with-user.type';

@Injectable()
export class UniversalVotesService {
  constructor(
    @InjectRepository(UniversalVote)
    private readonly voteRepo: Repository<UniversalVote>,
  ) {}

  async castVote(
    dto: CastVoteDto,
    user: User | SafeUser,
  ): Promise<{ upvotes: number; downvotes: number; score: number; userVote: number }> {
    const existing = await this.voteRepo.findOne({
      where: {
        targetType: dto.targetType,
        targetId: dto.targetId,
        user: { id: user.id },
      },
    });

    if (existing) {
      if (existing.value === dto.value) {
        // Toggle off if already voted same
        await this.voteRepo.remove(existing);
      } else {
        existing.value = dto.value;
        await this.voteRepo.save(existing);
      }
    } else {
      const vote = this.voteRepo.create({
        targetType: dto.targetType,
        targetId: dto.targetId,
        value: dto.value,
        user: { id: user.id } as User,
      });
      await this.voteRepo.save(vote);
    }

    return this.getVotesSummary(dto.targetType, dto.targetId, user.id);
  }

  async getVotesSummary(
    targetType: string,
    targetId: number,
    userId?: number,
  ): Promise<{ upvotes: number; downvotes: number; score: number; userVote: number }> {
    const votes = await this.voteRepo.find({
      where: { targetType, targetId },
    });

    let upvotes = 0;
    let downvotes = 0;
    let userVote = 0;

    for (const v of votes) {
      if (v.value === 1) upvotes++;
      if (v.value === -1) downvotes++;
      if (userId && v.user && v.user.id === userId) {
        userVote = v.value;
      }
    }

    return {
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      userVote,
    };
  }
}
