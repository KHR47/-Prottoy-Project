import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import type { RequestWithUser } from '../common/types/request-with-user.type';
import { UniversalVotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('votes')
export class UniversalVotesController {
  constructor(private readonly service: UniversalVotesService) {}

  @Public()
  @Get()
  getVotes(
    @Query('targetType') targetType: string,
    @Query('targetId', ParseIntPipe) targetId: number,
    @Request() req?: RequestWithUser,
  ) {
    return this.service.getVotesSummary(targetType, targetId, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  castVote(
    @Body() dto: CastVoteDto,
    @Request() req: RequestWithUser,
  ) {
    return this.service.castVote(dto, req.user);
  }
}
