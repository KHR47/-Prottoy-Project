import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UniversalComment } from './entities/universal-comment.entity';
import { UniversalCommentsService } from './comments.service';
import { UniversalCommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UniversalComment])],
  controllers: [UniversalCommentsController],
  providers: [UniversalCommentsService],
  exports: [UniversalCommentsService],
})
export class UniversalCommentsModule {}
