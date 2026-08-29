import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user.type';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMyNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.findMyNotifications(req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('ack')
  ackNotification(
    @Body('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
