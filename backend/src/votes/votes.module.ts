import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversalVote } from './entities/universal-vote.entity';
import { UniversalVotesService } from './votes.service';
import { UniversalVotesController } from './votes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UniversalVote])],
  controllers: [UniversalVotesController],
  providers: [UniversalVotesService],
  exports: [UniversalVotesService],
})
export class UniversalVotesModule {}
