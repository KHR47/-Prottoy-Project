import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import type { RequestWithUser } from '../common/types/request-with-user.type';
import { UniversalCommentsService } from './comments.service';
import { CreateUniversalCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class UniversalCommentsController {
  constructor(private readonly service: UniversalCommentsService) {}

  @Public()
  @Get()
  findByTarget(
    @Query('targetType') targetType: string,
    @Query('targetId', ParseIntPipe) targetId: number,
  ) {
    return this.service.findByTarget(targetType, targetId);
  }

  @Public()
  @Post()
  create(
    @Body() dto: CreateUniversalCommentDto,
    @Request() req?: RequestWithUser,
  ) {
    return this.service.create(dto, req?.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.service.remove(id, req.user);
  }
}
