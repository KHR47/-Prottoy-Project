import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SafeUser } from '../common/types/request-with-user.type';
import { User } from '../users/entities/user.entity';
import { Notification } from './entities/notification.entity';
import { ReportsGateway } from '../gateway/reports.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    private readonly reportsGateway: ReportsGateway,
  ) {}

  async createNotification(
    user: SafeUser | User | number,
    message: string,
    reportId?: number | null,
    type: string = 'general',
  ) {
    const targetUserId = typeof user === 'object' && user !== null ? user.id : Number(user);
    if (!targetUserId || isNaN(targetUserId)) {
      return null;
    }

    const notification = this.notificationsRepository.create({
      user: { id: targetUserId } as User,
      message,
      reportId: reportId ?? null,
      type,
    });

    const savedNotification =
      await this.notificationsRepository.save(notification);

    // Emit real-time event if gateway is available
    if (this.reportsGateway?.server) {
      this.reportsGateway.server
        .to(`user_${targetUserId}`)
        .emit('new_notification', savedNotification);
    }

    return savedNotification;
  }

  findMyNotifications(userId: number) {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }
}
